using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;

namespace FinAdvisor.Application.Commands.Upload;

public class BulkImportSipsCommandHandler(ISipPlanRepository sipRepo)
{
    public async Task<SipBulkImportResult> HandleAsync(
        SipImportParseResult parsed,
        CancellationToken ct = default)
    {
        var existing = await sipRepo.GetAllAsync(ct);
        // Dedup by fund name (case-insensitive)
        var existingNames = existing
            .Select(s => s.FundName.ToLowerInvariant())
            .ToHashSet();

        int imported = 0, skipped = 0;

        foreach (var row in parsed.Sips)
        {
            if (existingNames.Contains(row.FundName.ToLowerInvariant()))
            {
                skipped++;
                continue;
            }

            if (!DateOnly.TryParse(row.StartDate, out var startDate))
                startDate = DateOnly.FromDateTime(DateTime.UtcNow);

            var sip = SipPlan.Create(
                row.FundName,
                row.FundCode,
                row.MonthlyAmount,
                row.SipDate,
                startDate,
                row.BenchmarkIndex,
                linkedGoalId: null);

            // Pause if the source says Paused
            if (row.Status.Equals("Paused", StringComparison.OrdinalIgnoreCase))
                sip.Pause();

            await sipRepo.AddAsync(sip, ct);
            existingNames.Add(row.FundName.ToLowerInvariant());
            imported++;
        }

        return new SipBulkImportResult(imported, skipped, parsed.Source);
    }
}
