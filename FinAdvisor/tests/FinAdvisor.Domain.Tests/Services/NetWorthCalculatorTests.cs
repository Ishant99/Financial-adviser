using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.Services;
using FluentAssertions;

namespace FinAdvisor.Domain.Tests.Services;

public class NetWorthCalculatorTests
{
    private static Holding MakeHolding(decimal currentValue)
    {
        var accountId = Guid.NewGuid();
        return Holding.Create(
            accountId,
            HoldingType.MutualFund,
            "Test Fund",
            units: 1m,
            purchaseNav: currentValue,
            currentNav: currentValue,
            asOf: DateTimeOffset.UtcNow);
    }

    [Fact]
    public void Calculate_AssetsOnly_ReturnsTotalCurrentValue()
    {
        var holdings = new[]
        {
            MakeHolding(100_000m),
            MakeHolding(200_000m),
            MakeHolding(50_000m)
        };

        var result = NetWorthCalculator.Calculate(holdings);

        result.Amount.Should().Be(350_000m);
    }

    [Fact]
    public void Calculate_MultipleHoldings_SumsAll()
    {
        var holdings = new[]
        {
            MakeHolding(300_000m),
            MakeHolding(150_000m),
            MakeHolding(50_000m)
        };

        var result = NetWorthCalculator.Calculate(holdings);

        result.Amount.Should().Be(500_000m);
    }

    [Fact]
    public void Calculate_EmptyHoldings_ReturnsZero()
    {
        var result = NetWorthCalculator.Calculate([]);
        result.Amount.Should().Be(0m);
    }

    [Fact]
    public void BreakdownByType_GroupsCorrectly()
    {
        var accountId = Guid.NewGuid();
        var mf1 = Holding.Create(accountId, HoldingType.MutualFund, "MF1", 1m, 100_000m, 100_000m, DateTimeOffset.UtcNow);
        var mf2 = Holding.Create(accountId, HoldingType.MutualFund, "MF2", 1m, 50_000m, 50_000m, DateTimeOffset.UtcNow);
        var fd = Holding.Create(accountId, HoldingType.FD, "FD", 1m, 200_000m, 200_000m, DateTimeOffset.UtcNow);

        var breakdown = NetWorthCalculator.BreakdownByType([mf1, mf2, fd]);

        breakdown[HoldingType.MutualFund].Amount.Should().Be(150_000m);
        breakdown[HoldingType.FD].Amount.Should().Be(200_000m);
    }
}
