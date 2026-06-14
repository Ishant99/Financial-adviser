using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfHoldingRepository(AppDbContext db)
    : EfRepository<Holding>(db), IHoldingRepository
{
    public async Task<IReadOnlyList<Holding>> GetByAccountAsync(Guid accountId, CancellationToken ct = default) =>
        await Db.Holdings.Where(h => h.AccountId == accountId).ToListAsync(ct);
}
