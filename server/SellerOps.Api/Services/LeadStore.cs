using System.Text.Json;
using SellerOps.Api.Models;

namespace SellerOps.Api.Services;

public sealed class LeadStore(IWebHostEnvironment environment, ILogger<LeadStore> logger)
{
    private readonly SemaphoreSlim _gate = new(1, 1);
    private readonly string _path = Path.Combine(environment.ContentRootPath, "App_Data", "leads.ndjson");

    public async Task<LeadReceipt> SaveAsync(LeadRequest request, CancellationToken cancellationToken)
    {
        var receipt = new LeadReceipt(
            $"SO-{DateTimeOffset.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..8].ToUpperInvariant()}",
            DateTimeOffset.UtcNow
        );

        var payload = new
        {
            receipt.Reference,
            receipt.ReceivedAtUtc,
            request.Name,
            request.Email,
            request.Phone,
            request.Website,
            request.Message,
            request.Source
        };

        Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
        var line = JsonSerializer.Serialize(payload) + Environment.NewLine;

        await _gate.WaitAsync(cancellationToken);
        try
        {
            await File.AppendAllTextAsync(_path, line, cancellationToken);
        }
        finally
        {
            _gate.Release();
        }

        logger.LogInformation("Lead stored with reference {Reference}", receipt.Reference);
        return receipt;
    }
}
