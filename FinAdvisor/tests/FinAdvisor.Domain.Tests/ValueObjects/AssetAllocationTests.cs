using FinAdvisor.Domain.ValueObjects;
using FluentAssertions;

namespace FinAdvisor.Domain.Tests.ValueObjects;

public class AssetAllocationTests
{
    [Fact]
    public void Create_ValidAllocation_Succeeds()
    {
        var aa = new AssetAllocation(60, 30, 5, 5);
        aa.EquityPercent.Should().Be(60);
        aa.DebtPercent.Should().Be(30);
        aa.GoldPercent.Should().Be(5);
        aa.CashPercent.Should().Be(5);
    }

    [Fact]
    public void Create_SumNot100_Throws()
    {
        var act = () => new AssetAllocation(60, 30, 5, 4); // sum = 99
        act.Should().Throw<ArgumentException>().WithMessage("*100*");
    }

    [Fact]
    public void Create_NegativePercent_Throws()
    {
        var act = () => new AssetAllocation(-10, 80, 20, 10);
        act.Should().Throw<ArgumentException>().WithMessage("*negative*");
    }

    [Fact]
    public void IsConservative_WhenEquityBelow40_ReturnsTrue()
    {
        new AssetAllocation(30, 60, 5, 5).IsConservative.Should().BeTrue();
    }

    [Fact]
    public void IsConservative_WhenEquity40OrMore_ReturnsFalse()
    {
        new AssetAllocation(40, 50, 5, 5).IsConservative.Should().BeFalse();
    }

    [Fact]
    public void IsAggressive_WhenEquity70OrMore_ReturnsTrue()
    {
        new AssetAllocation(70, 25, 5, 0).IsAggressive.Should().BeTrue();
    }

    [Fact]
    public void IsAggressive_WhenEquityBelow70_ReturnsFalse()
    {
        new AssetAllocation(60, 30, 5, 5).IsAggressive.Should().BeFalse();
    }

    [Fact]
    public void Equality_SameAllocation_AreEqual()
    {
        var a = new AssetAllocation(60, 30, 5, 5);
        var b = new AssetAllocation(60, 30, 5, 5);
        a.Should().Be(b);
    }

    [Fact]
    public void AllEquity_Returns100PercentEquity()
    {
        var aa = AssetAllocation.AllEquity();
        aa.EquityPercent.Should().Be(100);
        aa.DebtPercent.Should().Be(0);
    }
}
