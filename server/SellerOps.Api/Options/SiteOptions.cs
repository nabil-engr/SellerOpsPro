namespace SellerOps.Api.Options;

public sealed class SiteOptions
{
    public const string SectionName = "Site";
    public string Name { get; init; } = "SellerOps Toolkit";
    public string BaseUrl { get; init; } = "https://example.com";
    public string ContactEmail { get; init; } = "nabilmaruf1122@gmail.com";
}
