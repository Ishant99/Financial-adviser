using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.ValueObjects;

namespace FinAdvisor.Domain.Services;

public static class NetWorthCalculator
{
    public static Money Calculate(IEnumerable<Holding> holdings)
    {
        var total = holdings.Aggregate(0m, (sum, h) => sum + h.CurrentValue);
        return new Money(total);
    }

    public static Dictionary<HoldingType, Money> BreakdownByType(IEnumerable<Holding> holdings)
    {
        return holdings
            .GroupBy(h => h.HoldingType)
            .ToDictionary(
                g => g.Key,
                g => new Money(g.Sum(h => h.CurrentValue)));
    }
}
