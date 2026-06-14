using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfGoalRepository(AppDbContext db)
    : EfRepository<Goal>(db), IGoalRepository
{
    public async Task<IReadOnlyList<Goal>> GetByStatusAsync(GoalStatus status, CancellationToken ct = default) =>
        await Db.Goals.Where(g => g.Status == status).ToListAsync(ct);

    public async Task<IReadOnlyList<Goal>> GetActiveAsync(CancellationToken ct = default) =>
        await Db.Goals.Where(g => g.Status == GoalStatus.Active).ToListAsync(ct);
}
