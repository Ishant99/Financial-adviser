using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Interfaces;

public interface IRecommendationRepository : IRepository<RecommendationLog>
{
    Task<IReadOnlyList<RecommendationLog>> GetUnreadAsync(CancellationToken ct = default);
    Task<IReadOnlyList<RecommendationLog>> GetByTypeAsync(RecommendationType type, CancellationToken ct = default);
    Task<IReadOnlyList<RecommendationLog>> GetRecentAsync(int limit, CancellationToken ct = default);
}
