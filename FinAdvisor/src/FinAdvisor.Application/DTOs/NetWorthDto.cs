namespace FinAdvisor.Application.DTOs;

public record NetWorthDto(
    decimal TotalNetWorth,
    string Currency,
    DateTimeOffset AsOf,
    IReadOnlyList<NetWorthCategoryDto> Breakdown);

public record NetWorthCategoryDto(
    string Category,
    decimal Value,
    decimal PercentOfTotal);
