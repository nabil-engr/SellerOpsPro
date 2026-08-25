namespace SellerOps.Api.Options;

public sealed class SiteOptions
{
    public const string SectionName = "Site";
    public string Name { get; init; } = "SellerOps Toolkit";
    public string BaseUrl { get; init; } = "https://sellerops-web.vercel.app";
    public string ContactEmail { get; init; } = "nabilmaruf1122@gmail.com";
}
