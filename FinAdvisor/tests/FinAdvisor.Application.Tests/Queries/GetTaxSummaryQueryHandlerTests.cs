using FinAdvisor.Application.Interfaces;
using FinAdvisor.Application.Queries;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Infrastructure.Persistence;
using FinAdvisor.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Application.Tests.Queries;

/// <summary>
/// Hand-verified tax cases — Finance Act 2024 rates (effective 23 Jul 2024):
///   LTCG 12.5% on gains above Rs 1,25,000 exemption (held > 12 months)
///   STCG 20% flat (held &lt;= 12 months)
/// </summary>
public class GetTaxSummaryQueryHandlerTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly IHoldingRepository _holdings;
    private readonly ISipPlanRepository _sips;
    private readonly GetTaxSummaryQueryHandler _handler;

    public GetTaxSummaryQueryHandlerTests()
    {
        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("TaxSummary_" + Guid.NewGuid())
            .Options;
        _db = new AppDbContext(opts);
        _holdings = new EfHoldingRepository(_db);
        _sips = new EfSipPlanRepository(_db);
        _handler = new GetTaxSummaryQueryHandler(_holdings, _sips);
    }

    private Holding AddHolding(
        HoldingType type, decimal units, decimal purchaseNav, decimal currentNav,
        DateOnly? purchaseDate = null, DateTimeOffset? asOf = null)
    {
        var account = Account.Create("Test", AccountType.SavingsBank, "Bank");
        _db.Accounts.Add(account);
        var h = Holding.Create(
            account.Id, type, "Fund " + Guid.NewGuid().ToString("N")[..6],
            units, purchaseNav, currentNav,
            asOf ?? DateTimeOffset.UtcNow, purchaseDate);
        _db.Holdings.Add(h);
        _db.SaveChanges();
        return h;
    }

    /// <summary>
    /// Held 14 months → LTCG.
    /// gain = (300 - 100) * 1000 = Rs 2,00,000
    /// LTCG tax = (2,00,000 − 1,25,000) × 12.5% = 75,000 × 0.125 = Rs 9,375
    /// </summary>
    [Fact]
    public async Task Ltcg_GainAboveExemption_CorrectTax()
    {
        var purchaseDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(-14));
        AddHolding(HoldingType.MutualFund, units: 1000m, purchaseNav: 100m, currentNav: 300m,
            purchaseDate: purchaseDate);

        var result = await _handler.HandleAsync();

        result.LtcgGains.Should().Be(200_000m);
        result.EstimatedLtcgTax.Should().Be(9_375m);
        result.StcgGains.Should().Be(0m);
        result.EstimatedStcgTax.Should().Be(0m);
    }

    /// <summary>
    /// Held 14 months, gain = Rs 80,000 (below Rs 1.25L exemption) → LTCG tax = 0.
    /// gain = (180 - 100) * 1000 = 80,000 &lt; 1,25,000
    /// </summary>
    [Fact]
    public async Task Ltcg_GainBelowExemption_ZeroTax()
    {
        var purchaseDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(-14));
        AddHolding(HoldingType.MutualFund, units: 1000m, purchaseNav: 100m, currentNav: 180m,
            purchaseDate: purchaseDate);

        var result = await _handler.HandleAsync();

        result.LtcgGains.Should().Be(80_000m);
        result.EstimatedLtcgTax.Should().Be(0m);
    }

    /// <summary>
    /// Held 8 months → STCG.
    /// gain = (200 - 100) * 500 = Rs 50,000
    /// STCG tax = 50,000 × 20% = Rs 10,000
    /// </summary>
    [Fact]
    public async Task Stcg_HoldingUnder12Months_CorrectTax()
    {
        var purchaseDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(-8));
        AddHolding(HoldingType.Stock, units: 500m, purchaseNav: 100m, currentNav: 200m,
            purchaseDate: purchaseDate);

        var result = await _handler.HandleAsync();

        result.StcgGains.Should().Be(50_000m);
        result.EstimatedStcgTax.Should().Be(10_000m);
        result.LtcgGains.Should().Be(0m);
        result.EstimatedLtcgTax.Should().Be(0m);
    }

    /// <summary>
    /// PurchaseDate = null → falls back to AsOf. AsOf 2 years ago → classified LTCG.
    /// </summary>
    [Fact]
    public async Task FallbackToAsOf_WhenPurchaseDateNull_ClassifiesAsLtcg()
    {
        AddHolding(HoldingType.MutualFund, units: 100m, purchaseNav: 50m, currentNav: 150m,
            purchaseDate: null, asOf: DateTimeOffset.UtcNow.AddYears(-2));

        var result = await _handler.HandleAsync();

        result.Holdings.Single().TaxCategory.Should().Be("LTCG");
    }

    /// <summary>Cash holdings are excluded entirely from tax calculations.</summary>
    [Fact]
    public async Task Cash_IsExcludedFromTaxCalculation()
    {
        AddHolding(HoldingType.Cash, units: 1m, purchaseNav: 100_000m, currentNav: 110_000m,
            asOf: DateTimeOffset.UtcNow.AddYears(-2));

        var result = await _handler.HandleAsync();

        result.Holdings.Should().BeEmpty();
        result.LtcgGains.Should().Be(0m);
        result.StcgGains.Should().Be(0m);
    }

    /// <summary>FD income is classified as Slab regardless of holding period.</summary>
    [Fact]
    public async Task Fd_ClassifiedAsSlab_NotLtcgOrStcg()
    {
        var purchaseDate = DateOnly.FromDateTime(DateTime.Today.AddMonths(-18));
        AddHolding(HoldingType.FD, units: 1m, purchaseNav: 100_000m, currentNav: 112_000m,
            purchaseDate: purchaseDate);

        var result = await _handler.HandleAsync();

        result.Holdings.Single().TaxCategory.Should().Be("Slab");
        result.LtcgGains.Should().Be(0m);
        result.StcgGains.Should().Be(0m);
    }

    public void Dispose() => _db.Dispose();
}
