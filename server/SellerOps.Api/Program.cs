using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Options;
using SellerOps.Api.Models;
using SellerOps.Api.Options;
using SellerOps.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(options => options.Limits.MaxRequestBodySize = 256 * 1024);

builder.Services.AddOptions<SiteOptions>()
    .Bind(builder.Configuration.GetSection(SiteOptions.SectionName))
    .Validate(options => !string.IsNullOrWhiteSpace(options.Name), "Site name is required.")
    .Validate(options => Uri.TryCreate(options.BaseUrl, UriKind.Absolute, out var uri) && uri.Scheme == Uri.UriSchemeHttps,
        "Site BaseUrl must be an absolute HTTPS URL.")
    .Validate(options => !string.IsNullOrWhiteSpace(options.ContactEmail) && new EmailAddressAttribute().IsValid(options.ContactEmail),
        "Site contact email must be valid.")
    .ValidateOnStart();
builder.Services.AddProblemDetails();
builder.Services.AddResponseCompression(options => options.EnableForHttps = true);
builder.Services.AddSingleton<LeadStore>();
builder.Services.AddSingleton<SitemapService>();
builder.Services.AddSingleton<SafeWebsiteAuditService>();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("forms", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 12,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                AutoReplenishment = true
            }));

    options.AddPolicy("audit", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(10),
                QueueLimit = 0,
                AutoReplenishment = true
            }));
});

var app = builder.Build();

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
    app.UseHsts();
    app.UseHttpsRedirection();
}

app.Use(async (context, next) =>
{
    if (HttpMethods.IsGet(context.Request.Method) || HttpMethods.IsHead(context.Request.Method))
    {
        var path = context.Request.Path.Value ?? string.Empty;
        string? canonicalPath = null;
        if (path.EndsWith("/index.html", StringComparison.OrdinalIgnoreCase))
        {
            var parent = path[..^"/index.html".Length];
            canonicalPath = string.IsNullOrEmpty(parent) ? "/" : parent;
        }
        else if (path.Equals("/index.csr.html", StringComparison.OrdinalIgnoreCase))
            canonicalPath = "/";
        else if (path.Length > 1 && path.EndsWith("/", StringComparison.Ordinal) && !Path.HasExtension(path))
            canonicalPath = path.TrimEnd('/');

        if (canonicalPath is not null)
        {
            context.Response.Redirect($"{canonicalPath}{context.Request.QueryString}", permanent: true, preserveMethod: true);
            return;
        }
    }
    await next();
});

app.Use(async (context, next) =>
{
    context.Response.Headers["X-Content-Type-Options"] = "nosniff";
    context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    context.Response.Headers["X-Frame-Options"] = "SAMEORIGIN";
    if (context.Request.Path.StartsWithSegments("/api"))
        context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
    context.Response.Headers["Content-Security-Policy"] =
        "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; " +
        "script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self' data:; object-src 'none'; " +
        "base-uri 'self'; frame-ancestors 'self'; form-action 'self'; upgrade-insecure-requests";
    await next();
});

app.UseResponseCompression();
app.UseRateLimiter();
app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var ext = Path.GetExtension(ctx.File.Name);
        if (ext is ".js" or ".css" or ".woff2")
            ctx.Context.Response.Headers.CacheControl = "public,max-age=31536000,immutable";
        else if (ext is ".png" or ".webp" or ".svg" or ".ico")
            ctx.Context.Response.Headers.CacheControl = "public,max-age=86400";
        else if (ext == ".html")
            ctx.Context.Response.Headers.CacheControl = "public,max-age=300";
    }
});

app.Use(async (context, next) =>
{
    if (HttpMethods.IsGet(context.Request.Method) &&
        !context.Request.Path.StartsWithSegments("/api") &&
        !Path.HasExtension(context.Request.Path.Value))
    {
        var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
        var relative = context.Request.Path.Value?.Trim('/') ?? string.Empty;
        var candidate = Path.GetFullPath(Path.Combine(webRoot, relative, "index.html"));
        var normalizedRoot = Path.GetFullPath(webRoot) + Path.DirectorySeparatorChar;
        if (candidate.StartsWith(normalizedRoot, StringComparison.OrdinalIgnoreCase) && File.Exists(candidate))
        {
            if (relative.Equals("404", StringComparison.OrdinalIgnoreCase))
            {
                context.Response.StatusCode = StatusCodes.Status404NotFound;
                context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
            }
            context.Response.ContentType = "text/html; charset=utf-8";
            context.Response.Headers.CacheControl = "public,max-age=300";
            await context.Response.SendFileAsync(candidate);
            return;
        }
    }
    await next();
});

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "SellerOps.Api", utc = DateTimeOffset.UtcNow }));

app.MapPost("/api/leads", async (LeadRequest request, LeadStore store, CancellationToken ct) =>
{
    // Honeypot: silently accept obvious automated submissions without persisting them.
    if (!string.IsNullOrWhiteSpace(request.Honeypot))
        return Results.Ok(new LeadReceipt("SO-RECEIVED", DateTimeOffset.UtcNow));

    var validationContext = new ValidationContext(request);
    var validationResults = new List<ValidationResult>();
    if (!Validator.TryValidateObject(request, validationContext, validationResults, validateAllProperties: true))
    {
        var errors = validationResults
            .SelectMany(result => (result.MemberNames.Any() ? result.MemberNames : new[] { "form" })
                .Select(member => (member, message: result.ErrorMessage ?? "Invalid value.")))
            .GroupBy(x => x.member, StringComparer.OrdinalIgnoreCase)
            .ToDictionary(g => g.Key, g => g.Select(x => x.message).Distinct().ToArray(), StringComparer.OrdinalIgnoreCase);
        return Results.ValidationProblem(errors);
    }

    var receipt = await store.SaveAsync(request with
    {
        Name = request.Name.Trim(),
        Email = request.Email.Trim(),
        Phone = request.Phone?.Trim(),
        Website = request.Website?.Trim(),
        Message = request.Message.Trim(),
        Source = request.Source?.Trim(),
        Honeypot = null
    }, ct);
    return Results.Ok(receipt);
}).RequireRateLimiting("forms");

app.MapPost("/api/site-audit", async (SiteAuditRequest request, SafeWebsiteAuditService service, CancellationToken ct) =>
{
    try { return Results.Ok(await service.AuditAsync(request.Url, ct)); }
    catch (ArgumentException ex) { return Results.BadRequest(new { error = ex.Message }); }
    catch (InvalidOperationException ex) { return Results.BadRequest(new { error = ex.Message }); }
    catch (TaskCanceledException) when (!ct.IsCancellationRequested)
    { return Results.Problem("The remote website took too long to respond.", statusCode: StatusCodes.Status504GatewayTimeout); }
    catch (HttpRequestException)
    { return Results.Problem("The public website could not be reached.", statusCode: StatusCodes.Status502BadGateway); }
    catch (System.Text.RegularExpressions.RegexMatchTimeoutException)
    { return Results.Problem("The returned HTML could not be safely analyzed.", statusCode: StatusCodes.Status422UnprocessableEntity); }
}).RequireRateLimiting("audit");

app.MapGet("/sitemap.xml", async (SitemapService sitemap, CancellationToken ct) =>
    Results.Text(await sitemap.BuildAsync(ct), "application/xml; charset=utf-8"));

app.MapGet("/robots.txt", (IOptions<SiteOptions> options) =>
{
    var baseUrl = options.Value.BaseUrl.TrimEnd('/');
    return Results.Text($"User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: {baseUrl}/sitemap.xml\n", "text/plain; charset=utf-8");
});

app.MapFallback(async context =>
{
    context.Response.StatusCode = StatusCodes.Status404NotFound;
    context.Response.ContentType = "text/html; charset=utf-8";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers["X-Robots-Tag"] = "noindex, nofollow";
    var webRoot = app.Environment.WebRootPath ?? Path.Combine(app.Environment.ContentRootPath, "wwwroot");
    var notFound = Path.Combine(webRoot, "404", "index.html");
    if (File.Exists(notFound))
        await context.Response.SendFileAsync(notFound);
    else
        await context.Response.WriteAsync("Page not found.");
});

app.Run();
