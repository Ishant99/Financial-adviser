using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.Services;

namespace FinAdvisor.Application.Queries;

/// <summary>
/// Reconstructs a rolling net-worth trend from current holdings and transaction history.
/// Works backwards from today's net worth, removing each month's net cash-flow to
/// estimate what the balance looked like at the start of that month.
/// </summary>
public class GetNetWorthHistoryQueryHandler(
    IHoldingRepository holdingRepo,
    ITransactionRepository txRepo)
{
    public async Task<IReadOnlyList<NetWorthHistoryPointDto>> HandleAsync(
        int months = 12,
        CancellationToken ct = default)
    {
        months = Math.Clamp(months, 1, 24);

        var holdings = await holdingRepo.GetAllAsync(ct);
        var currentNetWorth = NetWorthCalculator.Calculate(holdings).Amount;

        var toDate   = DateOnly.FromDateTime(DateTime.Today);
        var fromDate = toDate.AddMonths(-months);

        var txns = await txRepo.GetByDateRangeAsync(fromDate, toDate, ct);

        // Net cash-flow per (year, month)
        var netByMonth = txns
            .GroupBy(t => (t.Date.Year, t.Date.Month))
            .ToDictionary(
                g => g.Key,
                g => g.Sum(t => t.TransactionType == TransactionType.Credit
                    ? (double)t.Amount : -(double)t.Amount));

        // Walk backwards: V(n-1) = V(n) - net_cashflow(n)
        var result = new List<NetWorthHistoryPointDto>(months);
        var runningValue = (double)currentNetWorth;

        for (int i = 0; i < months; i++)
        {
            var date  = toDate.AddMonths(-i);
            var label = new DateTime(date.Year, date.Month, 1).ToString("MMM yy");
            result.Add(new NetWorthHistoryPointDto(date.Year, date.Month, label, (decimal)Math.Max(0, runningValue)));

            if (i < months - 1)
            {
                var net = netByMonth.GetValueOrDefault((date.Year, date.Month), 0);
                runningValue -= net;
            }
        }

        result.Reverse();
        return result;
    }
}
