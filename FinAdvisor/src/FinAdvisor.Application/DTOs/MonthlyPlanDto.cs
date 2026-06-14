namespace FinAdvisor.Application.DTOs;

public record MonthlyPlanContext(
    decimal TotalIncome,
    decimal TotalExpenses,
    decimal TotalSip,
    decimal NetWorth,
    int ActiveGoalCount,
    IReadOnlyList<ExpenseCategory> TopExpenseCategories,
    IReadOnlyList<GoalSummary> Goals);

public record ExpenseCategory(string Category, decimal Amount);
public record GoalSummary(string Name, decimal Target, decimal? Probability);

public record MonthlyPlanResponse(
    decimal Surplus,
    IReadOnlyList<MonthlyPlanSection> Sections,
    string OverallNarrative);

public record MonthlyPlanSection(string Title, decimal? Amount, string Narrative);
