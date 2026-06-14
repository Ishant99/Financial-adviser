using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Plan;

public class GenerateMonthlyPlanCommandHandler(
    ITransactionRepository transactions,
    ISipPlanRepository sipPlans,
    IGoalRepository goals,
    IHoldingRepository holdings,
    IAnalyticsService analytics)
{
    public async Task<MonthlyPlanResponse> HandleAsync(CancellationToken ct = default)
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var monthStart = new DateOnly(today.Year, today.Month, 1);
        var monthEnd = today;

        var txns = await transactions.GetByDateRangeAsync(monthStart, monthEnd, ct);

        var income = txns.Where(t => t.TransactionType == TransactionType.Credit).Sum(t => t.Amount);
        var expenses = txns.Where(t => t.TransactionType == TransactionType.Debit).Sum(t => t.Amount);

        var topCategories = txns
            .Where(t => t.TransactionType == TransactionType.Debit)
            .GroupBy(t => t.Category)
            .Select(g => new ExpenseCategory(g.Key, g.Sum(t => t.Amount)))
            .OrderByDescending(c => c.Amount)
            .Take(5)
            .ToList();

        var activeSips = await sipPlans.GetActiveAsync(ct);
        var totalSip = activeSips.Sum(s => s.MonthlyAmount);

        var allHoldings = await holdings.GetAllAsync(ct);
        var netWorth = allHoldings.Sum(h => h.CurrentValue);

        var activeGoals = await goals.GetActiveAsync(ct);
        var goalSummaries = activeGoals
            .Select(g => new GoalSummary(g.Name, g.TargetAmount, g.ProbabilityOfSuccess))
            .ToList();

        var context = new MonthlyPlanContext(
            income, expenses, totalSip, netWorth,
            activeGoals.Count, topCategories, goalSummaries);

        return await analytics.GenerateMonthlyPlanAsync(context, ct);
    }
}
