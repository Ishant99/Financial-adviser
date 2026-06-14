namespace FinAdvisor.Application.DTOs;

public record SipPlanDto(
    Guid Id,
    string FundName,
    string FundCode,
    decimal MonthlyAmount,
    int SipDate,
    DateOnly StartDate,
    string Status,
    Guid? LinkedGoalId,
    string? LinkedGoalName,
    string BenchmarkIndex,
    decimal? LatestXirr,
    DateTimeOffset? XirrCalculatedAt);

public record AddSipPlanRequest(
    string FundName,
    string FundCode,
    decimal MonthlyAmount,
    int SipDate,
    DateOnly StartDate,
    string BenchmarkIndex,
    Guid? LinkedGoalId);
