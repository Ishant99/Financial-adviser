namespace FinAdvisor.Domain.ValueObjects;

public sealed class DateRange : IEquatable<DateRange>
{
    public DateOnly Start { get; }
    public DateOnly End { get; }

    public DateRange(DateOnly start, DateOnly end)
    {
        if (start > end)
            throw new ArgumentException($"Start ({start}) must be <= End ({end}).");
        Start = start;
        End = end;
    }

    public bool Contains(DateOnly date) => date >= Start && date <= End;

    public int Months =>
        (End.Year - Start.Year) * 12 + End.Month - Start.Month;

    public bool Equals(DateRange? other) =>
        other is not null && Start == other.Start && End == other.End;

    public override bool Equals(object? obj) => Equals(obj as DateRange);
    public override int GetHashCode() => HashCode.Combine(Start, End);
    public static bool operator ==(DateRange? a, DateRange? b) => a?.Equals(b) ?? b is null;
    public static bool operator !=(DateRange? a, DateRange? b) => !(a == b);

    public override string ToString() => $"{Start:yyyy-MM-dd} to {End:yyyy-MM-dd}";
}
