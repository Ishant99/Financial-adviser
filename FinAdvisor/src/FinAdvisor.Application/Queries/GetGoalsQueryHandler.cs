using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetGoalsQueryHandler(IGoalRepository goalRepo)
{
    public async Task<IReadOnlyList<GoalDto>> HandleAsync(CancellationToken ct = default)
    {
        var goals = await goalRepo.GetAllAsync(ct);
        return goals.Select(ToDto).ToList();
    }

    public async Task<GoalDto?> HandleAsync(Guid id, CancellationToken ct = default)
    {
        var goal = await goalRepo.GetByIdAsync(id, ct);
        return goal is null ? null : ToDto(goal);
    }

    private static GoalDto ToDto(Domain.Entities.Goal g) => new(
        g.Id, g.Name, g.TargetAmount, g.TargetDate, g.Priority,
        g.Status.ToString(),
        new AssetAllocationDto(
            g.TargetAssetAllocation.EquityPercent,
            g.TargetAssetAllocation.DebtPercent,
            g.TargetAssetAllocation.GoldPercent,
            g.TargetAssetAllocation.CashPercent),
        g.ProbabilityOfSuccess, g.P10Corpus, g.P50Corpus, g.P90Corpus,
        g.CreatedAt);
}
