using System.Text.Json;
using System.Xml.Linq;
using Microsoft.Extensions.Options;
using SellerOps.Api.Options;

namespace SellerOps.Api.Services;

public sealed class SitemapService(IWebHostEnvironment environment, IOptions<SiteOptions> options)
{
    private readonly SiteOptions _site = options.Value;

    public async Task<string> BuildAsync(CancellationToken cancellationToken)
    {
        var path = Path.Combine(environment.ContentRootPath, "Data", "seo-routes.json");
        await using var stream = File.OpenRead(path);
        var routes = await JsonSerializer.DeserializeAsync<SeoRoutes>(
            stream,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true },
            cancellationToken
        ) ?? new SeoRoutes();

        var baseUrl = _site.BaseUrl.TrimEnd('/');
        var urls = new List<string>();
        urls.AddRange(routes.Static.Select(x => string.IsNullOrWhiteSpace(x) ? $"{baseUrl}/" : $"{baseUrl}/{x}"));
        urls.AddRange(routes.Categories.Select(x => $"{baseUrl}/categories/{x}"));
        urls.AddRange(routes.Tools.Select(x => $"{baseUrl}/tools/{x}"));
        urls.AddRange(routes.Guides.Select(x => $"{baseUrl}/guides/{x}"));

        XNamespace ns = "http://www.sitemaps.org/schemas/sitemap/0.9";
        var doc = new XDocument(
            new XDeclaration("1.0", "UTF-8", null),
            new XElement(ns + "urlset",
                urls.Distinct(StringComparer.OrdinalIgnoreCase).Select(url =>
                    new XElement(ns + "url",
                        new XElement(ns + "loc", url)
                    )
                )
            )
        );

        return doc.ToString(SaveOptions.DisableFormatting);
    }

    private sealed class SeoRoutes
    {
        public List<string> Tools { get; init; } = [];
        public List<string> Categories { get; init; } = [];
        public List<string> Guides { get; init; } = [];
        public List<string> Static { get; init; } = [];
    }
}
