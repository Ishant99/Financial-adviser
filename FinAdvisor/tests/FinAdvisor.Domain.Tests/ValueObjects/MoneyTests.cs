using FinAdvisor.Domain.ValueObjects;
using FluentAssertions;

namespace FinAdvisor.Domain.Tests.ValueObjects;

public class MoneyTests
{
    [Fact]
    public void Create_WithValidAmount_Succeeds()
    {
        var m = new Money(100m);
        m.Amount.Should().Be(100m);
        m.Currency.Should().Be("INR");
    }

    [Fact]
    public void Add_SameCurrency_ReturnsSummedAmount()
    {
        var a = new Money(100m);
        var b = new Money(250m);
        (a + b).Amount.Should().Be(350m);
    }

    [Fact]
    public void Subtract_SameCurrency_ReturnsDifference()
    {
        var a = new Money(500m);
        var b = new Money(200m);
        (a - b).Amount.Should().Be(300m);
    }

    [Fact]
    public void Multiply_ReturnsScaledAmount()
    {
        var m = new Money(1000m);
        (m * 1.2m).Amount.Should().Be(1200m);
    }

    [Fact]
    public void Equality_SameAmountAndCurrency_AreEqual()
    {
        var a = new Money(100m, "INR");
        var b = new Money(100m, "INR");
        a.Should().Be(b);
        (a == b).Should().BeTrue();
    }

    [Fact]
    public void Equality_DifferentAmounts_AreNotEqual()
    {
        var a = new Money(100m);
        var b = new Money(200m);
        a.Should().NotBe(b);
    }

    [Fact]
    public void Add_DifferentCurrencies_Throws()
    {
        var inr = new Money(100m, "INR");
        var usd = new Money(100m, "USD");
        var act = () => _ = inr + usd;
        act.Should().Throw<InvalidOperationException>();
    }

    [Fact]
    public void IsPositive_WhenAmountPositive_ReturnsTrue()
    {
        new Money(1m).IsPositive.Should().BeTrue();
        new Money(-1m).IsPositive.Should().BeFalse();
        new Money(0m).IsPositive.Should().BeFalse();
    }

    [Fact]
    public void Zero_ReturnsMoneyWithZeroAmount()
    {
        Money.Zero().Amount.Should().Be(0m);
    }

    [Fact]
    public void Currency_IsNormalisedToUpperCase()
    {
        new Money(1m, "inr").Currency.Should().Be("INR");
    }
}
