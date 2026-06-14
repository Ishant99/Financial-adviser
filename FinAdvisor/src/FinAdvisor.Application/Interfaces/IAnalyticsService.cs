using FinAdvisor.Application.DTOs;

namespace FinAdvisor.Application.Interfaces;

public interface IAnalyticsService
{
    Task<CasParseResult> ParseCasAsync(Stream pdfStream, string? password, CancellationToken ct = default);

    Task<IReadOnlyList<GeneratedRecommendationResult>> GenerateRecommendationsAsync(
        GenerateRecommendationsRequest request,
        CancellationToken ct = default);

    Task<GoalSimulationResponse> SimulateGoalAsync(
        GoalSimulationRequest request,
        CancellationToken ct = default);

    Task<XirrResponse> ComputeXirrAsync(XirrRequest request, CancellationToken ct = default);

    Task<MonthlyPlanResponse> GenerateMonthlyPlanAsync(MonthlyPlanContext context, CancellationToken ct = default);
}
