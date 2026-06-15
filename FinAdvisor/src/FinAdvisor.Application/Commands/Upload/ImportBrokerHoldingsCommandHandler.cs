using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Upload;

public class ImportBrokerHoldingsCommandHandler(IHoldingRepository holdings)
{
    private static HoldingType MapCategory(string? category) => category?.ToLowerInvariant() switch
    {
        "equity"  => HoldingType.MutualFund,
        "hybrid"  => HoldingType.MutualFund,
        "debt"    => HoldingType.MutualFund,
        "etf"     => HoldingType.Stock,
        "stock"   => HoldingType.Stock,
        _         => HoldingType.MutualFund,
    };

    public async Task<HoldingsImportResult> HandleAsync(
        HoldingsImportParseResult parsed,
        Guid accountId,
        CancellationToken ct = default)
    {
        var existing = await holdings.GetByAccountAsync(accountId);
        var byName = existing.ToDictionary(h => h.Name, StringComparer.OrdinalIgnoreCase);

        int imported = 0, updated = 0, skipped = 0;

        DateOnly? asOf = null;
        if (parsed.AsOfDate is not null && DateOnly.TryParse(parsed.AsOfDate, out var d))
            asOf = d;

        foreach (var row in parsed.Holdings)
        {
            var holdingType = MapCategory(row.Category);

            if (byName.TryGetValue(row.SchemeName, out var existing_h))
            {
                existing_h.UpdateFromCas(row.Units, row.CurrentNav,
                    asOf.HasValue
                        ? new DateTimeOffset(asOf.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
                        : DateTimeOffset.UtcNow,
                    null);
                await holdings.UpdateAsync(existing_h);
                updated++;
            }
            else
            {
                var h = Holding.Create(
                    accountId,
                    holdingType,
                    row.SchemeName,
                    row.Units,
                    row.PurchaseNav,
                    row.CurrentNav,
                    asOf.HasValue
                        ? new DateTimeOffset(asOf.Value.ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
                        : DateTimeOffset.UtcNow,
                    purchaseDate: null);

                await holdings.AddAsync(h);
                imported++;
            }
        }

        return new HoldingsImportResult(imported, updated, skipped, parsed.Source, parsed.TotalCurrentValue);
    }
}
