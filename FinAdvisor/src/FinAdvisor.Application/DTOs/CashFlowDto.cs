namespace FinAdvisor.Application.DTOs;

public record CashFlowCategoryDto(string Category, decimal Amount, string Type);

public record CashFlowMonthDto(
    int Year,
    int Month,
    string Label,
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal Net,
    IReadOnlyList<CashFlowCategoryDto> Categories);
