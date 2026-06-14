using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.Goals;

public class RecalculateGoalProbabilityCommandHandler(
    IGoalRepository goals,
    ISipPlanRepository sipPlans,
    IHoldingRepository holdings,
    IAnalyticsService analytics)
{
    public async Task<GoalDto?> HandleAsync(Guid goalId, CancellationToken ct = default)
    {
        var goal = await goals.GetByIdAsync(goalId, ct);
        if (goal is null) return null;

        var allSips = await sipPlans.GetActiveAsync(ct);
        var goalSips = allSips.Where(s => s.LinkedGoalId == goalId).ToList();
        var monthlySip = goalSips.Sum(s => s.MonthlyAmount);

        // Current corpus: sum the value of holdings whose name matches a fund
        // linked to this goal via SIP. Falls back to equal-split across active
        // goals only when no SIPs are linked (so every goal gets a fair share).
        var allHoldings = await holdings.GetAllAsync(ct);
        decimal currentCorpus;
        if (goalSips.Any())
        {
            var sipFundNames = new HashSet<string>(
                goalSips.Select(s => s.FundName), StringComparer.OrdinalIgnoreCase);
            currentCorpus = allHoldings
                .Where(h => sipFundNames.Contains(h.Name))
                .Sum(h => h.CurrentValue);
        }
        else
        {
            var totalPortfolio = allHoldings.Sum(h => h.CurrentValue);
            var activeGoalCount = (await goals.GetActiveAsync(ct)).Count;
            currentCorpus = activeGoalCount > 0 ? totalPortfolio / activeGoalCount : 0m;
        }

        var yearsToGoal = (goal.TargetDate.ToDateTime(TimeOnly.MinValue) - DateTime.Today).TotalDays / 365.25;
        if (yearsToGoal <= 0) yearsToGoal = 0.083; // minimum 1 month

        var request = new GoalSimulationRequest(
            goal.TargetAmount,
            (decimal)yearsToGoal,
            currentCorpus,
            monthlySip,
            goal.TargetAssetAllocation.EquityPercent,
            goal.TargetAssetAllocation.DebtPercent,
            goal.TargetAssetAllocation.GoldPercent,
            goal.TargetAssetAllocation.CashPercent);

        var result = await analytics.SimulateGoalAsync(request, ct);

        goal.UpdateProbability(result.ProbabilityOfSuccess, result.P10Corpus, result.P50Corpus, result.P90Corpus);
        await goals.UpdateAsync(goal, ct);

        return AddGoalCommandHandler.ToDto(goal);
    }
}
