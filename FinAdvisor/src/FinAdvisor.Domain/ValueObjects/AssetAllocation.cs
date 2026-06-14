namespace FinAdvisor.Domain.ValueObjects;

public sealed class AssetAllocation : IEquatable<AssetAllocation>
{
    public decimal EquityPercent { get; }
    public decimal DebtPercent { get; }
    public decimal GoldPercent { get; }
    public decimal CashPercent { get; }

    public AssetAllocation(
        decimal equityPercent,
        decimal debtPercent,
        decimal goldPercent,
        decimal cashPercent)
    {
        var sum = equityPercent + debtPercent + goldPercent + cashPercent;
        if (Math.Abs(sum - 100m) > 0.01m)
            throw new ArgumentException(
                $"Allocation percentages must sum to 100. Got {sum}.");
        if (equityPercent < 0 || debtPercent < 0 || goldPercent < 0 || cashPercent < 0)
            throw new ArgumentException("Allocation percentages cannot be negative.");

        EquityPercent = equityPercent;
        DebtPercent = debtPercent;
        GoldPercent = goldPercent;
        CashPercent = cashPercent;
    }

    // Conservative: equity < 40%
    public bool IsConservative => EquityPercent < 40m;

    // Aggressive: equity >= 70%
    public bool IsAggressive => EquityPercent >= 70m;

    public static AssetAllocation AllEquity() => new(100, 0, 0, 0);
    public static AssetAllocation AllDebt() => new(0, 100, 0, 0);
    public static AssetAllocation Balanced() => new(60, 30, 5, 5);

    public bool Equals(AssetAllocation? other) =>
        other is not null &&
        EquityPercent == other.EquityPercent &&
        DebtPercent == other.DebtPercent &&
        GoldPercent == other.GoldPercent &&
        CashPercent == other.CashPercent;

    public override bool Equals(object? obj) => Equals(obj as AssetAllocation);
    public override int GetHashCode() =>
        HashCode.Combine(EquityPercent, DebtPercent, GoldPercent, CashPercent);
    public static bool operator ==(AssetAllocation? a, AssetAllocation? b) => a?.Equals(b) ?? b is null;
    public static bool operator !=(AssetAllocation? a, AssetAllocation? b) => !(a == b);

    public override string ToString() =>
        $"Equity {EquityPercent}% / Debt {DebtPercent}% / Gold {GoldPercent}% / Cash {CashPercent}%";
}
