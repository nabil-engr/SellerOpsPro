using System.ComponentModel.DataAnnotations;

namespace SellerOps.Api.Models;

public sealed record LeadRequest(
    [property: Required, StringLength(120)] string Name,
    [property: Required, EmailAddress, StringLength(200)] string Email,
    [property: StringLength(50)] string? Phone,
    [property: StringLength(500)] string? Website,
    [property: Required, StringLength(2000, MinimumLength = 10)] string Message,
    [property: StringLength(80)] string? Source,
    [property: StringLength(120)] string? Honeypot
);

public sealed record LeadReceipt(string Reference, DateTimeOffset ReceivedAtUtc);
