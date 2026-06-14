using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfRecommendationRepository(AppDbContext db)
    : EfRepository<RecommendationLog>(db), IRecommendationRepository
{
    public async Task<IReadOnlyList<RecommendationLog>> GetUnreadAsync(CancellationToken ct = default) =>
        await Db.RecommendationLogs
            .Where(r => !r.IsRead)
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<RecommendationLog>> GetByTypeAsync(
        RecommendationType type, CancellationToken ct = default) =>
        await Db.RecommendationLogs
            .Where(r => r.Type == type)
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync(ct);

    public async Task<IReadOnlyList<RecommendationLog>> GetRecentAsync(
        int limit, CancellationToken ct = default) =>
        await Db.RecommendationLogs
            .OrderByDescending(r => r.GeneratedAt)
            .Take(limit)
            .ToListAsync(ct);
}
