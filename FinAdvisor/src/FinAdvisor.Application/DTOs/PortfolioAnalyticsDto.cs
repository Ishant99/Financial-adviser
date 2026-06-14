namespace FinAdvisor.Application.DTOs;

public record HoldingAnalyticsDto(
    string Name,
    string HoldingType,
    decimal CurrentValue,
    decimal PurchasedValue,
    decimal GainLoss,
    decimal GainLossPercent,
    decimal? Cagr,
    int HoldingMonths,
    string? Sector,
    string? MarketCapCategory);

public record AllocationByTypeDto(
    string HoldingType,
    decimal TotalValue,
    decimal PercentOfPortfolio,
    int HoldingCount);

public record AllocationByGroupDto(
    string Label,
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
    IReadOnlyList<HoldingAnalyticsDto> Holdings,
    IReadOnlyList<AllocationByGroupDto> AllocationBySector,
    IReadOnlyList<AllocationByGroupDto> AllocationByMarketCap,
    decimal? SharpeRatio);
