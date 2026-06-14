using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Queries;

public class GetCashFlowQueryHandler(ITransactionRepository transactionRepo)
{
    public async Task<IReadOnlyList<CashFlowMonthDto>> HandleAsync(int months = 6, CancellationToken ct = default)
    {
        months = Math.Clamp(months, 1, 24);

        var today = DateOnly.FromDateTime(DateTime.Today);
        var firstOfRange = new DateOnly(today.Year, today.Month, 1).AddMonths(-(months - 1));

        var transactions = await transactionRepo.GetByDateRangeAsync(firstOfRange, today, ct);

        // Build lookup (year, month) → transactions
        var byMonth = transactions
            .GroupBy(t => (t.Date.Year, t.Date.Month))
            .ToDictionary(g => g.Key, g => g.ToList());

        var result = new List<CashFlowMonthDto>(months);

        for (int i = 0; i < months; i++)
        {
            var date = firstOfRange.AddMonths(i);
            var key = (date.Year, date.Month);
            var txs = byMonth.TryGetValue(key, out var list) ? list : [];

            var income   = txs.Where(t => t.TransactionType == TransactionType.Credit).Sum(t => t.Amount);
            var expenses = txs.Where(t => t.TransactionType == TransactionType.Debit).Sum(t => t.Amount);

            var categories = txs
                .GroupBy(t => new { t.Category, Type = t.TransactionType.ToString() })
                .Select(cg => new CashFlowCategoryDto(
                    cg.Key.Category,
                    cg.Sum(t => t.Amount),
                    cg.Key.Type))
                .OrderByDescending(c => c.Amount)
                .ToList<CashFlowCategoryDto>();

            var label = new DateTime(date.Year, date.Month, 1)
                .ToString("MMM yyyy", System.Globalization.CultureInfo.InvariantCulture);

            result.Add(new CashFlowMonthDto(
                date.Year, date.Month, label,
                income, expenses, income - expenses,
                categories));
        }

        return result;
    }
}
