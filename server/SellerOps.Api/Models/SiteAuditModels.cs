namespace SellerOps.Api.Models;

public sealed record SiteAuditRequest(string Url);
public sealed record AuditCheck(string Key,string Label,bool Passed,string Detail,int Weight);
public sealed record SiteAuditResult(
    string Url,int HttpStatus,long ResponseTimeMs,int Score,string? Title,string? MetaDescription,
    IReadOnlyList<AuditCheck> Checks
);
