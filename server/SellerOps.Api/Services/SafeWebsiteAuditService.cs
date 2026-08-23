using System.Diagnostics;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using SellerOps.Api.Models;

namespace SellerOps.Api.Services;

public sealed partial class SafeWebsiteAuditService(ILogger<SafeWebsiteAuditService> logger)
{
    private const int MaxRedirects = 3;
    private const int MaxBytes = 1_000_000;

    public async Task<SiteAuditResult> AuditAsync(string rawUrl, CancellationToken cancellationToken)
    {
        if (!TryNormalizeUrl(rawUrl, out var uri))
            throw new ArgumentException("Enter a valid public http:// or https:// URL on port 80 or 443.");

        using var handler = new SocketsHttpHandler
        {
            AllowAutoRedirect = false,
            AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate | DecompressionMethods.Brotli,
            ConnectTimeout = TimeSpan.FromSeconds(5),
            PooledConnectionLifetime = TimeSpan.FromMinutes(2),
            ConnectCallback = ConnectToValidatedPublicHostAsync
        };
        using var client = new HttpClient(handler) { Timeout = TimeSpan.FromSeconds(10) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("SellerOpsAuditBot/1.0 (+public-page-seo-audit)");
        client.DefaultRequestHeaders.Accept.ParseAdd("text/html,application/xhtml+xml;q=0.9,*/*;q=0.1");

        Uri current = uri!;
        HttpResponseMessage? response = null;
        var sw = Stopwatch.StartNew();

        try
        {
            for (var redirect = 0; redirect <= MaxRedirects; redirect++)
            {
                ValidateTargetUri(current);
                await EnsurePublicHostAsync(current, cancellationToken);
                response?.Dispose();
                response = await client.GetAsync(current, HttpCompletionOption.ResponseHeadersRead, cancellationToken);

                if (!IsRedirect(response.StatusCode)) break;
                if (redirect == MaxRedirects || response.Headers.Location is null)
                    throw new InvalidOperationException("Too many redirects or an invalid redirect target.");

                current = response.Headers.Location.IsAbsoluteUri
                    ? response.Headers.Location
                    : new Uri(current, response.Headers.Location);
                ValidateTargetUri(current);
            }

            if (response is null) throw new InvalidOperationException("No response was received.");

            var mediaType = response.Content.Headers.ContentType?.MediaType;
            if (!string.IsNullOrWhiteSpace(mediaType) &&
                !mediaType.Contains("html", StringComparison.OrdinalIgnoreCase) &&
                !mediaType.Equals("text/plain", StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("The target did not return an HTML page.");

            await using var source = await response.Content.ReadAsStreamAsync(cancellationToken);
            using var limited = new MemoryStream();
            var buffer = new byte[16 * 1024];
            var total = 0;

            while (true)
            {
                var read = await source.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
                if (read == 0) break;
                total += read;
                if (total > MaxBytes) throw new InvalidOperationException("Page HTML is larger than the audit limit.");
                await limited.WriteAsync(buffer.AsMemory(0, read), cancellationToken);
            }
            sw.Stop();

            var charset = response.Content.Headers.ContentType?.CharSet;
            Encoding encoding;
            try { encoding = !string.IsNullOrWhiteSpace(charset) ? Encoding.GetEncoding(charset.Trim('"')) : Encoding.UTF8; }
            catch { encoding = Encoding.UTF8; }

            var html = encoding.GetString(limited.ToArray());
            var title = MatchGroup(TitleRegex(), html);
            var description = MatchMeta(html, "name", "description", "content");
            var canonical = MatchMeta(html, "rel", "canonical", "href", "link");
            var viewport = MatchMeta(html, "name", "viewport", "content");
            var robots = MatchMeta(html, "name", "robots", "content");
            var ogTitle = MatchMeta(html, "property", "og:title", "content");
            var ogDescription = MatchMeta(html, "property", "og:description", "content");
            var ogImage = MatchMeta(html, "property", "og:image", "content");
            var twitterCard = MatchMeta(html, "name", "twitter:card", "content");
            var language = MatchGroup(HtmlLangRegex(), html);
            var hasJsonLd = JsonLdRegex().IsMatch(html);
            var h1Count = H1Regex().Matches(html).Count;

            var checks = new List<AuditCheck>
            {
                C("https","HTTPS",current.Scheme=="https",current.Scheme=="https"?"Page uses HTTPS.":"Page is not using HTTPS.",10),
                C("status","Successful HTTP status",response.IsSuccessStatusCode,$"HTTP {(int)response.StatusCode}.",10),
                C("title","Page title",!string.IsNullOrWhiteSpace(title)&&title.Length is >=15 and <=70,
                    string.IsNullOrWhiteSpace(title)?"No <title> found.":$"{title.Length} characters.",12),
                C("description","Meta description",!string.IsNullOrWhiteSpace(description)&&description.Length is >=70 and <=180,
                    string.IsNullOrWhiteSpace(description)?"No meta description found.":$"{description.Length} characters.",10),
                C("h1","Primary H1",h1Count==1,$"{h1Count} H1 element(s) found.",8),
                C("viewport","Mobile viewport",!string.IsNullOrWhiteSpace(viewport),string.IsNullOrWhiteSpace(viewport)?"No viewport meta tag found.":"Viewport meta tag found.",8),
                C("canonical","Canonical URL",!string.IsNullOrWhiteSpace(canonical),string.IsNullOrWhiteSpace(canonical)?"No canonical link found.":canonical!,10),
                C("robots","Indexability hint",!ContainsNoIndex(robots),ContainsNoIndex(robots)?"Meta robots contains noindex.":"No meta noindex detected.",8),
                C("og","Open Graph metadata",!string.IsNullOrWhiteSpace(ogTitle)&&!string.IsNullOrWhiteSpace(ogDescription)&&!string.IsNullOrWhiteSpace(ogImage),
                    "Checks og:title, og:description and og:image.",7),
                C("lang","Document language",!string.IsNullOrWhiteSpace(language),string.IsNullOrWhiteSpace(language)?"No lang attribute found on <html>.":$"Language is {language}.",5),
                C("jsonld","JSON-LD structured data",hasJsonLd,hasJsonLd?"JSON-LD block found.":"No JSON-LD structured data found.",6),
                C("twitter","Social card metadata",!string.IsNullOrWhiteSpace(twitterCard),string.IsNullOrWhiteSpace(twitterCard)?"No twitter:card found.":$"Card type is {twitterCard}.",6)
            };

            var score = checks.Sum(x => x.Passed ? x.Weight : 0);
            logger.LogInformation("Audited {Url} with score {Score}", current, score);
            return new SiteAuditResult(current.ToString(), (int)response.StatusCode, sw.ElapsedMilliseconds, score, title, description, checks);
        }
        finally
        {
            response?.Dispose();
        }
    }

    private static async ValueTask<Stream> ConnectToValidatedPublicHostAsync(SocketsHttpConnectionContext context, CancellationToken cancellationToken)
    {
        var host = context.DnsEndPoint.Host;
        var addresses = await ResolvePublicAddressesAsync(host, cancellationToken);
        Exception? last = null;

        foreach (var address in addresses)
        {
            var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp) { NoDelay = true };
            try
            {
                await socket.ConnectAsync(new IPEndPoint(address, context.DnsEndPoint.Port), cancellationToken);
                return new NetworkStream(socket, ownsSocket: true);
            }
            catch (Exception ex) when (ex is SocketException or OperationCanceledException)
            {
                socket.Dispose();
                last = ex;
                if (ex is OperationCanceledException) throw;
            }
        }

        throw new HttpRequestException("Could not connect to the validated public host.", last);
    }

    private static AuditCheck C(string key,string label,bool passed,string detail,int weight) => new(key,label,passed,detail,weight);

    private static bool TryNormalizeUrl(string raw, out Uri? uri)
    {
        uri = null;
        if (string.IsNullOrWhiteSpace(raw) || raw.Length > 2048) return false;
        var candidate = raw.Trim();
        if (!candidate.Contains("://", StringComparison.Ordinal)) candidate = "https://" + candidate;
        if (!Uri.TryCreate(candidate, UriKind.Absolute, out var parsed)) return false;
        try { ValidateTargetUri(parsed); }
        catch { return false; }
        uri = parsed;
        return true;
    }

    private static void ValidateTargetUri(Uri uri)
    {
        if (uri.Scheme is not ("http" or "https") || string.IsNullOrWhiteSpace(uri.Host))
            throw new InvalidOperationException("Target must use HTTP or HTTPS.");
        if (!string.IsNullOrWhiteSpace(uri.UserInfo))
            throw new InvalidOperationException("URLs containing credentials are not allowed.");
        if (uri.Port is not (80 or 443))
            throw new InvalidOperationException("Only standard website ports 80 and 443 are allowed.");
        if (uri.Host.Equals("localhost", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException("Local addresses are not allowed.");
    }

    private static async Task EnsurePublicHostAsync(Uri uri, CancellationToken cancellationToken)
    {
        _ = await ResolvePublicAddressesAsync(uri.DnsSafeHost, cancellationToken);
    }

    private static async Task<IPAddress[]> ResolvePublicAddressesAsync(string host, CancellationToken cancellationToken)
    {
        IPAddress[] addresses;
        try { addresses = await Dns.GetHostAddressesAsync(host).WaitAsync(cancellationToken); }
        catch (Exception ex) when (ex is SocketException or ArgumentException)
        { throw new InvalidOperationException("The host could not be resolved.", ex); }

        if (addresses.Length == 0 || addresses.Any(IsPrivateOrSpecial))
            throw new InvalidOperationException("Private, loopback, link-local, multicast and reserved addresses are not allowed.");
        return addresses;
    }

    private static bool IsPrivateOrSpecial(IPAddress ip)
    {
        if (IPAddress.IsLoopback(ip) || ip.Equals(IPAddress.Any) || ip.Equals(IPAddress.IPv6Any)) return true;
        if (ip.IsIPv4MappedToIPv6) return IsPrivateOrSpecial(ip.MapToIPv4());

        if (ip.AddressFamily == AddressFamily.InterNetwork)
        {
            var b=ip.GetAddressBytes();
            return b[0]==0 || b[0]==10 || b[0]==127 || (b[0]==169&&b[1]==254) ||
                   (b[0]==172&&b[1] is >=16 and <=31) || (b[0]==192&&b[1]==168) ||
                   (b[0]==100&&b[1] is >=64 and <=127) ||
                   (b[0]==192&&b[1]==0&&(b[2]==0||b[2]==2)) ||
                   (b[0]==192&&b[1]==88&&b[2]==99) ||
                   (b[0]==198&&b[1] is 18 or 19) || (b[0]==198&&b[1]==51&&b[2]==100) ||
                   (b[0]==203&&b[1]==0&&b[2]==113) || b[0]>=224;
        }
        if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        {
            var b=ip.GetAddressBytes();
            return ip.IsIPv6LinkLocal || ip.IsIPv6Multicast || ip.IsIPv6SiteLocal ||
                   (b[0]&0xFE)==0xFC || (b[0]==0x20&&b[1]==0x01&&b[2]==0x0D&&b[3]==0xB8) ||
                   ip.Equals(IPAddress.IPv6Loopback) || ip.Equals(IPAddress.IPv6None);
        }
        return true;
    }

    private static bool IsRedirect(HttpStatusCode status) =>
        status is HttpStatusCode.MovedPermanently or HttpStatusCode.Redirect or HttpStatusCode.RedirectMethod or
        HttpStatusCode.TemporaryRedirect or HttpStatusCode.PermanentRedirect;

    private static string? MatchGroup(Regex regex,string html)
    {
        var m=regex.Match(html);
        return m.Success ? WebUtility.HtmlDecode(m.Groups[1].Value.Trim()) : null;
    }

    private static string? MatchMeta(string html,string key,string expected,string valueKey,string tag="meta")
    {
        var tagRegex=new Regex($@"<{tag}\b[^>]*>",RegexOptions.IgnoreCase|RegexOptions.Singleline,TimeSpan.FromMilliseconds(200));
        var attrRegex=new Regex(@"(?<n>[A-Za-z_:][-A-Za-z0-9_:.]*)\s*=\s*(?:""(?<d>[^""]*)""|'(?<s>[^']*)'|(?<b>[^\s>]+))",
            RegexOptions.IgnoreCase|RegexOptions.Singleline,TimeSpan.FromMilliseconds(200));

        foreach(Match tm in tagRegex.Matches(html))
        {
            var dict=new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);
            foreach(Match a in attrRegex.Matches(tm.Value))
            {
                var v=a.Groups["d"].Success?a.Groups["d"].Value:a.Groups["s"].Success?a.Groups["s"].Value:a.Groups["b"].Value;
                dict[a.Groups["n"].Value]=WebUtility.HtmlDecode(v);
            }
            if(dict.TryGetValue(key,out var actual) &&
               actual.Split(' ',StringSplitOptions.RemoveEmptyEntries).Contains(expected,StringComparer.OrdinalIgnoreCase) &&
               dict.TryGetValue(valueKey,out var result))
                return result.Trim();
        }
        return null;
    }

    private static bool ContainsNoIndex(string? robots) =>
        !string.IsNullOrWhiteSpace(robots) &&
        robots.Split(',',StringSplitOptions.RemoveEmptyEntries|StringSplitOptions.TrimEntries)
              .Any(x=>x.Equals("noindex",StringComparison.OrdinalIgnoreCase));

    [GeneratedRegex(@"<title\b[^>]*>(.*?)</title>", RegexOptions.IgnoreCase|RegexOptions.Singleline, matchTimeoutMilliseconds:200)]
    private static partial Regex TitleRegex();

    [GeneratedRegex(@"<h1\b[^>]*>", RegexOptions.IgnoreCase|RegexOptions.Singleline, matchTimeoutMilliseconds:200)]
    private static partial Regex H1Regex();

    [GeneratedRegex("<html\\b[^>]*\\blang\\s*=\\s*[\"']?([^\\s\"'>]+)", RegexOptions.IgnoreCase|RegexOptions.Singleline, matchTimeoutMilliseconds:200)]
    private static partial Regex HtmlLangRegex();

    [GeneratedRegex("<script\\b[^>]*\\btype\\s*=\\s*[\"']application/ld\\+json[\"'][^>]*>", RegexOptions.IgnoreCase|RegexOptions.Singleline, matchTimeoutMilliseconds:200)]
    private static partial Regex JsonLdRegex();
}
