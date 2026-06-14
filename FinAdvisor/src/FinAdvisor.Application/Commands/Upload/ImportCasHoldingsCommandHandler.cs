using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Upload;

public class ImportCasHoldingsCommandHandler(
    IHoldingRepository holdings,
    IRepository<CasUploadLog> uploadLogs)
{
    public async Task<CasImportResult> HandleAsync(
        CasParseResult cas,
        Guid accountId,
        string fileName,
        CancellationToken ct = default)
    {
        var existing = await holdings.GetByAccountAsync(accountId);
        var existingByName = existing.ToDictionary(h => h.Name, StringComparer.OrdinalIgnoreCase);

        int imported = 0;
        int updated = 0;

        foreach (var ch in cas.Holdings)
        {
            DateOnly? purchaseDate = null;
            if (ch.EarliestPurchaseDate is not null
                && DateOnly.TryParseExact(ch.EarliestPurchaseDate, "yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture,
                    System.Globalization.DateTimeStyles.None, out var pd))
            {
                purchaseDate = pd;
            }

            if (existingByName.TryGetValue(ch.FundName, out var existingHolding))
            {
                existingHolding.UpdateFromCas(ch.Units, ch.Nav, DateTimeOffset.UtcNow, purchaseDate);
                await holdings.UpdateAsync(existingHolding);
                updated++;
            }
            else
            {
                var newHolding = Holding.Create(
                    accountId,
                    HoldingType.MutualFund,
                    ch.FundName,
                    ch.Units,
                    ch.Nav,
                    ch.Nav,
                    DateTimeOffset.UtcNow,
                    purchaseDate);
                await holdings.AddAsync(newHolding);
                imported++;
            }
        }

        var log = CasUploadLog.CreateSuccess(fileName, imported, updated, cas.InvestorName);
        await uploadLogs.AddAsync(log);

        return new CasImportResult(imported, updated, cas.InvestorName, cas.TotalValue, log.Id);
    }
}
