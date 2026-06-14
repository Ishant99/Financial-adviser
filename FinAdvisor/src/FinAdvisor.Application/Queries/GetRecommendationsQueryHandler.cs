using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetRecommendationsQueryHandler(IRecommendationRepository recommendations)
{
    public async Task<IReadOnlyList<RecommendationDto>> HandleAsync(
        int limit = 10,
        CancellationToken ct = default)
    {
        var recs = await recommendations.GetRecentAsync(limit, ct);

        return recs.Select(r => new RecommendationDto(
            r.Id,
            r.GeneratedAt,
            r.Type.ToString(),
            r.Category,
            r.Severity.ToString(),
            r.Title,
            r.Body,
            r.IsRead,
            r.IsActioned)).ToList();
    }
}
