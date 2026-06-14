using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Recommendations;

public class GenerateRecommendationsCommandHandler(
    IHoldingRepository holdings,
    IGoalRepository goals,
    ISipPlanRepository sipPlans,
    IAnalyticsService analytics,
    IRecommendationRepository recommendations)
{
    public async Task<IReadOnlyList<RecommendationDto>> HandleAsync(CancellationToken ct = default)
    {
        var allHoldings = await holdings.GetAllAsync(ct);
        var activeGoals = await goals.GetActiveAsync(ct);
        var activeSips = await sipPlans.GetActiveAsync(ct);

        var totalValue = allHoldings.Sum(h => h.CurrentValue);
        var monthlySipTotal = activeSips.Sum(s => s.MonthlyAmount);

        var holdingContexts = allHoldings.Select(h => new HoldingContext(
            h.Name,
            h.HoldingType.ToString(),
            h.CurrentValue,
            h.Units,
            h.PurchaseNav,
            h.CurrentNav,
            h.PurchaseNav == 0 ? 0m
                : Math.Round((h.CurrentNav - h.PurchaseNav) / h.PurchaseNav * 100m, 2)
        )).ToList();

        var goalContexts = activeGoals.Select(g => new GoalContext(
            g.Name,
            g.TargetAmount,
            g.TargetDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
            g.Status.ToString(),
            g.ProbabilityOfSuccess
        )).ToList();

        var request = new GenerateRecommendationsRequest(
            totalValue,
            monthlySipTotal,
            "INR",
            holdingContexts,
            goalContexts);

        var generated = await analytics.GenerateRecommendationsAsync(request, ct);

        var saved = new List<RecommendationLog>();
        foreach (var g in generated)
        {
            // Skip if a recommendation with this title was already generated today.
            if (await recommendations.ExistsTodayAsync(g.Title, ct))
                continue;

            if (!Enum.TryParse<RecommendationType>(g.Type, out var type))
                type = RecommendationType.Watch;
            if (!Enum.TryParse<RecommendationSeverity>(g.Severity, out var severity))
                severity = RecommendationSeverity.Info;

            var log = RecommendationLog.Create(type, g.Category, severity, g.Title, g.Body);
            await recommendations.AddAsync(log, ct);
            saved.Add(log);
        }

        return saved.Select(r => new RecommendationDto(
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
