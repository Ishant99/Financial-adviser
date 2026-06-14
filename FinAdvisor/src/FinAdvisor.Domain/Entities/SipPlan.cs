using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Domain.Entities;

public class SipPlan
{
    public Guid Id { get; private set; }
    public string FundName { get; private set; } = string.Empty;
    public string FundCode { get; private set; } = string.Empty;
    public decimal MonthlyAmount { get; private set; }
    public int SipDate { get; private set; }
    public DateOnly StartDate { get; private set; }
    public SipStatus Status { get; private set; }
    public Guid? LinkedGoalId { get; private set; }
    public string BenchmarkIndex { get; private set; } = string.Empty;

    // Populated by Hangfire job (Sprint 5)
    public decimal? LatestXirr { get; private set; }
    public DateTimeOffset? XirrCalculatedAt { get; private set; }

    public Goal? LinkedGoal { get; private set; }

    private SipPlan() { }

    public static SipPlan Create(
        string fundName,
        string fundCode,
        decimal monthlyAmount,
        int sipDate,
        DateOnly startDate,
        string benchmarkIndex,
        Guid? linkedGoalId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(fundName);
        ArgumentException.ThrowIfNullOrWhiteSpace(fundCode);
        ArgumentException.ThrowIfNullOrWhiteSpace(benchmarkIndex);
        if (monthlyAmount <= 0) throw new ArgumentException("Monthly amount must be positive.", nameof(monthlyAmount));
        if (sipDate is < 1 or > 28) throw new ArgumentOutOfRangeException(nameof(sipDate), "SIP date must be 1–28.");

        return new SipPlan
        {
            Id = Guid.NewGuid(),
            FundName = fundName,
            FundCode = fundCode,
            MonthlyAmount = monthlyAmount,
            SipDate = sipDate,
            StartDate = startDate,
            Status = SipStatus.Active,
            BenchmarkIndex = benchmarkIndex,
            LinkedGoalId = linkedGoalId
        };
    }

    public void Pause() => Status = SipStatus.Paused;
    public void Resume() => Status = SipStatus.Active;
    public void Stop() => Status = SipStatus.Stopped;

    public void UpdateXirr(decimal xirr)
    {
        LatestXirr = xirr;
        XirrCalculatedAt = DateTimeOffset.UtcNow;
    }

    public void UpdateMonthlyAmount(decimal newAmount)
    {
        if (newAmount <= 0) throw new ArgumentException("Monthly amount must be positive.", nameof(newAmount));
        MonthlyAmount = newAmount;
    }
}
