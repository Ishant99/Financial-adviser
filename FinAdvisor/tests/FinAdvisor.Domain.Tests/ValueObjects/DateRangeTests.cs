using FinAdvisor.Domain.ValueObjects;
using FluentAssertions;

namespace FinAdvisor.Domain.Tests.ValueObjects;

public class DateRangeTests
{
    [Fact]
    public void Create_StartAfterEnd_Throws()
    {
        var act = () => new DateRange(
            new DateOnly(2025, 6, 1),
            new DateOnly(2025, 1, 1));
        act.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Create_StartEqualsEnd_Succeeds()
    {
        var d = new DateOnly(2025, 1, 1);
        var range = new DateRange(d, d);
        range.Months.Should().Be(0);
    }

    [Fact]
    public void Contains_DateWithinRange_ReturnsTrue()
    {
        var range = new DateRange(
            new DateOnly(2025, 1, 1),
            new DateOnly(2025, 12, 31));
        range.Contains(new DateOnly(2025, 6, 15)).Should().BeTrue();
    }

    [Fact]
    public void Contains_DateOutsideRange_ReturnsFalse()
    {
        var range = new DateRange(
            new DateOnly(2025, 1, 1),
            new DateOnly(2025, 6, 30));
        range.Contains(new DateOnly(2025, 7, 1)).Should().BeFalse();
    }

    [Fact]
    public void Contains_BoundaryDates_ReturnsTrue()
    {
        var start = new DateOnly(2025, 1, 1);
        var end = new DateOnly(2025, 12, 31);
        var range = new DateRange(start, end);
        range.Contains(start).Should().BeTrue();
        range.Contains(end).Should().BeTrue();
    }

    [Fact]
    public void Months_SpansOneYear_Returns12()
    {
        var range = new DateRange(
            new DateOnly(2024, 1, 1),
            new DateOnly(2025, 1, 1));
        range.Months.Should().Be(12);
    }

    [Fact]
    public void Equality_SameRange_AreEqual()
    {
        var a = new DateRange(new DateOnly(2025, 1, 1), new DateOnly(2025, 12, 31));
        var b = new DateRange(new DateOnly(2025, 1, 1), new DateOnly(2025, 12, 31));
        a.Should().Be(b);
    }
}
