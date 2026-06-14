using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.ValueObjects;

namespace FinAdvisor.Application.Commands.Goals;

public class UpdateGoalCommandHandler(IGoalRepository goalRepo)
{
    public async Task<GoalDto?> HandleAsync(Guid id, UpdateGoalRequest req, CancellationToken ct = default)
    {
        var goal = await goalRepo.GetByIdAsync(id, ct);
        if (goal is null) return null;

        var allocation = new AssetAllocation(
            req.TargetAssetAllocation.EquityPercent,
            req.TargetAssetAllocation.DebtPercent,
            req.TargetAssetAllocation.GoldPercent,
            req.TargetAssetAllocation.CashPercent);

        goal.Update(req.Name, req.TargetAmount, req.TargetDate, req.Priority, allocation);
        await goalRepo.UpdateAsync(goal, ct);

        return AddGoalCommandHandler.ToDto(goal);
    }
}
