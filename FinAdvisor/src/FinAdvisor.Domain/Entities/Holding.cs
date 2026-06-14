using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Domain.Entities;

public class Holding
{
    public Guid Id { get; private set; }
    public Guid AccountId { get; private set; }
    public HoldingType HoldingType { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public decimal Units { get; private set; }
    public decimal PurchaseNav { get; private set; }
    public decimal CurrentNav { get; private set; }
    public decimal CurrentValue { get; private set; }
    public DateTimeOffset AsOf { get; private set; }
    // Actual purchase date used for LTCG/STCG classification.
    // Nullable for backwards-compatibility with holdings created before this field existed.
    public DateOnly? PurchaseDate { get; private set; }

    public Account Account { get; private set; } = null!;

    private Holding() { }

    public static Holding Create(
        Guid accountId,
        HoldingType holdingType,
        string name,
        decimal units,
        decimal purchaseNav,
        decimal currentNav,
        DateTimeOffset asOf,
        DateOnly? purchaseDate = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        if (units < 0) throw new ArgumentException("Units cannot be negative.", nameof(units));
        if (purchaseNav < 0) throw new ArgumentException("Purchase NAV cannot be negative.", nameof(purchaseNav));
        if (currentNav < 0) throw new ArgumentException("Current NAV cannot be negative.", nameof(currentNav));

        return new Holding
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            HoldingType = holdingType,
            Name = name,
            Units = units,
            PurchaseNav = purchaseNav,
            CurrentNav = currentNav,
            CurrentValue = units * currentNav,
            AsOf = asOf,
            PurchaseDate = purchaseDate
        };
    }

    public void UpdateNav(decimal newNav, DateTimeOffset asOf)
    {
        if (newNav < 0) throw new ArgumentException("NAV cannot be negative.", nameof(newNav));
        CurrentNav = newNav;
        CurrentValue = Units * newNav;
        AsOf = asOf;
    }

    public void UpdateFromCas(decimal units, decimal nav, DateTimeOffset asOf, DateOnly? purchaseDate = null)
    {
        if (units < 0) throw new ArgumentException("Units cannot be negative.", nameof(units));
        if (nav < 0) throw new ArgumentException("NAV cannot be negative.", nameof(nav));
        Units = units;
        CurrentNav = nav;
        CurrentValue = units * nav;
        AsOf = asOf;
        // Only overwrite PurchaseDate if the CAS statement provides one and we don't already have it.
        if (purchaseDate.HasValue && !PurchaseDate.HasValue)
            PurchaseDate = purchaseDate;
    }

    public void SetPurchaseDate(DateOnly purchaseDate)
    {
        PurchaseDate = purchaseDate;
    }
}
