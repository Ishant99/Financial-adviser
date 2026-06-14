using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.ValueObjects;

namespace FinAdvisor.Domain.Entities;

public class Goal
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal TargetAmount { get; private set; }
    public DateOnly TargetDate { get; private set; }
    public int Priority { get; private set; }
    public GoalStatus Status { get; private set; }
    public AssetAllocation TargetAssetAllocation { get; private set; } = null!;
    public DateTimeOffset CreatedAt { get; private set; }

    // Populated by Hangfire job (Sprint 6)
    public decimal? ProbabilityOfSuccess { get; private set; }
    public decimal? P10Corpus { get; private set; }
    public decimal? P50Corpus { get; private set; }
    public decimal? P90Corpus { get; private set; }
    public DateTimeOffset? ProbabilityCalculatedAt { get; private set; }

    private Goal() { }

    public static Goal Create(
        string name,
        decimal targetAmount,
        DateOnly targetDate,
        int priority,
        AssetAllocation targetAssetAllocation)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        if (targetAmount <= 0) throw new ArgumentException("Target amount must be positive.", nameof(targetAmount));
        if (priority is < 1 or > 5) throw new ArgumentOutOfRangeException(nameof(priority), "Priority must be 1–5.");

        return new Goal
        {
            Id = Guid.NewGuid(),
            Name = name,
            TargetAmount = targetAmount,
            TargetDate = targetDate,
            Priority = priority,
            Status = GoalStatus.Active,
            TargetAssetAllocation = targetAssetAllocation,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Pause() => Status = GoalStatus.Paused;
    public void Resume() => Status = GoalStatus.Active;
    public void Complete() => Status = GoalStatus.Completed;

    public void UpdateProbability(
        decimal probability,
        decimal p10,
        decimal p50,
        decimal p90)
    {
        ProbabilityOfSuccess = probability;
        P10Corpus = p10;
        P50Corpus = p50;
        P90Corpus = p90;
        ProbabilityCalculatedAt = DateTimeOffset.UtcNow;
    }

    public void Update(string name, decimal targetAmount, DateOnly targetDate, int priority, AssetAllocation allocation)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        if (targetAmount <= 0) throw new ArgumentException("Target amount must be positive.", nameof(targetAmount));
        if (priority is < 1 or > 5) throw new ArgumentOutOfRangeException(nameof(priority), "Priority must be 1–5.");

        Name = name;
        TargetAmount = targetAmount;
        TargetDate = targetDate;
        Priority = priority;
        TargetAssetAllocation = allocation;
    }
}
