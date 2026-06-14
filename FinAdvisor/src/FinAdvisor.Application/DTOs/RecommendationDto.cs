namespace FinAdvisor.Application.DTOs;

public record RecommendationDto(
    Guid Id,
    DateTimeOffset GeneratedAt,
    string Type,
    string Category,
    string Severity,
    string Title,
    string Body,
    bool IsRead,
    bool IsActioned);

public record GenerateRecommendationsRequest(
    decimal TotalValue,
    decimal MonthlySipTotal,
    string Currency,
    IReadOnlyList<HoldingContext> Holdings,
    IReadOnlyList<GoalContext> Goals);

public record HoldingContext(
    string Name,
    string Type,
    decimal Value,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    decimal GainLossPct);

public record GoalContext(
    string Name,
    decimal TargetAmount,
    string TargetDate,
    string Status,
    decimal? ProbabilityOfSuccess);

public record GeneratedRecommendationResult(
    string Type,
    string Severity,
    string Category,
    string Title,
    string Body);
