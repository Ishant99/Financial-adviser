namespace FinAdvisor.Application.DTOs;

public record GoalDto(
    Guid Id,
    string Name,
    decimal TargetAmount,
    DateOnly TargetDate,
    int Priority,
    string Status,
    AssetAllocationDto TargetAssetAllocation,
    decimal? ProbabilityOfSuccess,
    decimal? P10Corpus,
    decimal? P50Corpus,
    decimal? P90Corpus,
    DateTimeOffset CreatedAt);

public record AssetAllocationDto(
    decimal EquityPercent,
    decimal DebtPercent,
    decimal GoldPercent,
    decimal CashPercent);

public record AddGoalRequest(
    string Name,
    decimal TargetAmount,
    DateOnly TargetDate,
    int Priority,
    AssetAllocationDto TargetAssetAllocation);

public record UpdateGoalRequest(
    string Name,
    decimal TargetAmount,
    DateOnly TargetDate,
    int Priority,
    AssetAllocationDto TargetAssetAllocation);
