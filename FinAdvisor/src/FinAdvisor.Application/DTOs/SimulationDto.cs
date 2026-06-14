namespace FinAdvisor.Application.DTOs;

public record GoalSimulationRequest(
    decimal TargetAmount,
    decimal YearsToGoal,
    decimal CurrentValue,
    decimal MonthlyContribution,
    decimal EquityPct,
    decimal DebtPct,
    decimal GoldPct,
    decimal CashPct);

public record GoalSimulationResponse(
    decimal ProbabilityOfSuccess,
    decimal P10Corpus,
    decimal P50Corpus,
    decimal P90Corpus);
