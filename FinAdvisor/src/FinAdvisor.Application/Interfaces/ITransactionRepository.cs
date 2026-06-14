using FinAdvisor.Domain.Entities;

namespace FinAdvisor.Application.Interfaces;

public interface ITransactionRepository : IRepository<Transaction>
{
    Task<IReadOnlyList<Transaction>> GetByAccountAndDateRangeAsync(
        Guid accountId,
        DateOnly from,
        DateOnly to,
        CancellationToken ct = default);

    Task<IReadOnlyList<Transaction>> GetByDateRangeAsync(
        DateOnly from,
        DateOnly to,
        CancellationToken ct = default);
}
