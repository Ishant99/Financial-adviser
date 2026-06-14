using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.ValueObjects;

namespace FinAdvisor.Application.Commands.Goals;

public class AddGoalCommandHandler(IGoalRepository goalRepo)
{
    public async Task<GoalDto> HandleAsync(AddGoalRequest req, CancellationToken ct = default)
    {
        var allocation = new AssetAllocation(
            req.TargetAssetAllocation.EquityPercent,
            req.TargetAssetAllocation.DebtPercent,
            req.TargetAssetAllocation.GoldPercent,
            req.TargetAssetAllocation.CashPercent);

        var goal = Goal.Create(req.Name, req.TargetAmount, req.TargetDate, req.Priority, allocation);
        await goalRepo.AddAsync(goal, ct);

        return ToDto(goal);
    }

    internal static GoalDto ToDto(Goal g) => new(
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
