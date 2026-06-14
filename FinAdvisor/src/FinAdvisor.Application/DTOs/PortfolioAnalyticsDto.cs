namespace FinAdvisor.Application.DTOs;

public record HoldingAnalyticsDto(
    string Name,
    string HoldingType,
    decimal CurrentValue,
    decimal PurchasedValue,
    decimal GainLoss,
    decimal GainLossPercent,
    decimal? Cagr,            // annualised; null when holding period < 1 month
    int HoldingMonths);

public record AllocationByTypeDto(
    string HoldingType,
    decimal TotalValue,
    decimal PercentOfPortfolio,
    int HoldingCount);

public record ConcentrationRiskDto(
    string Name,
    string HoldingType,
    decimal Value,
    decimal PercentOfPortfolio);

public record PortfolioAnalyticsDto(
    decimal TotalValue,
    decimal TotalPurchasedValue,
    decimal TotalGainLoss,
    decimal TotalGainLossPercent,
    IReadOnlyList<AllocationByTypeDto> AllocationByType,
    IReadOnlyList<ConcentrationRiskDto> TopConcentrations,
    IReadOnlyList<HoldingAnalyticsDto> Holdings);
