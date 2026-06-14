using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfTransactionRepository(AppDbContext db)
    : EfRepository<Transaction>(db), ITransactionRepository
{
    public async Task<IReadOnlyList<Transaction>> GetByAccountAndDateRangeAsync(
        Guid accountId, DateOnly from, DateOnly to, CancellationToken ct = default) =>
        await Db.Transactions
            .Where(t => t.AccountId == accountId && t.Date >= from && t.Date <= to)
            .OrderByDescending(t => t.Date)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<Transaction>> GetByDateRangeAsync(
        DateOnly from, DateOnly to, CancellationToken ct = default) =>
        await Db.Transactions
            .Where(t => t.Date >= from && t.Date <= to)
            .OrderByDescending(t => t.Date)
            .ToListAsync(ct);
}
