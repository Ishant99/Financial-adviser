using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetTransactionsQueryHandler(ITransactionRepository txRepo)
{
    public async Task<IReadOnlyList<TransactionDto>> HandleAsync(
        Guid? accountId,
        DateOnly? from,
        DateOnly? to,
        CancellationToken ct = default)
    {
        var effectiveTo = to ?? DateOnly.FromDateTime(DateTime.Today);
        var effectiveFrom = from ?? effectiveTo.AddMonths(-1);

        var txns = accountId.HasValue
            ? await txRepo.GetByAccountAndDateRangeAsync(accountId.Value, effectiveFrom, effectiveTo, ct)
            : await txRepo.GetByDateRangeAsync(effectiveFrom, effectiveTo, ct);

        return txns.Select(t => new TransactionDto(
            t.Id, t.AccountId, t.Date, t.Amount,
            t.TransactionType.ToString(),
            t.Category, t.Description, t.IsReconciled)).ToList();
    }
}
