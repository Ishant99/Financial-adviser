namespace FinAdvisor.Domain.ValueObjects;

public sealed class Xirr : IEquatable<Xirr>
{
    public decimal Value { get; }

    public Xirr(decimal value)
    {
        if (value < -1m || value > 2m)
            throw new ArgumentOutOfRangeException(nameof(value),
                "XIRR must be between -100% and +200%.");
        Value = value;
    }

    // Stored as a decimal fraction: 0.12 = 12%
    public decimal AsPercent => Value * 100m;
    public bool IsPositive => Value > 0;

    public bool BeatsBenchmark(Xirr benchmark) => Value > benchmark.Value;

    public static Xirr FromPercent(decimal percent) => new(percent / 100m);

    public bool Equals(Xirr? other) => other is not null && Value == other.Value;
    public override bool Equals(object? obj) => Equals(obj as Xirr);
    public override int GetHashCode() => Value.GetHashCode();
    public static bool operator ==(Xirr? a, Xirr? b) => a?.Equals(b) ?? b is null;
    public static bool operator !=(Xirr? a, Xirr? b) => !(a == b);

    public override string ToString() => $"{AsPercent:F2}%";
}
