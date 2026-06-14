using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetPortfolioAnalyticsQueryHandler(IHoldingRepository holdingRepo)
{
    public async Task<PortfolioAnalyticsDto> HandleAsync(CancellationToken ct = default)
    {
        var holdings = await holdingRepo.GetAllAsync(ct);
        var today    = DateOnly.FromDateTime(DateTime.Today);

        var totalValue     = holdings.Sum(h => h.CurrentValue);
        var totalPurchased = holdings.Sum(h => h.PurchaseNav * h.Units);
        var totalGainLoss  = totalValue - totalPurchased;
        var totalGainLossPct = totalPurchased > 0
            ? Math.Round(totalGainLoss / totalPurchased * 100m, 2)
            : 0m;

        // Per-holding analytics
        var holdingAnalytics = holdings.Select(h =>
        {
            var purchased     = h.PurchaseNav * h.Units;
            var gainLoss      = h.CurrentValue - purchased;
            var gainLossPct   = purchased > 0 ? Math.Round(gainLoss / purchased * 100m, 2) : 0m;

            var asOfDate      = DateOnly.FromDateTime(h.AsOf.LocalDateTime);
            var holdingMonths = Math.Max(0,
                (today.Year - asOfDate.Year) * 12 + today.Month - asOfDate.Month);

            // Annualised CAGR = (currentValue/purchasedValue)^(12/months) – 1
            decimal? cagr = null;
            if (holdingMonths >= 1 && purchased > 0 && h.CurrentValue > 0)
            {
                var ratio = (double)(h.CurrentValue / purchased);
                cagr = (decimal)(Math.Pow(ratio, 12.0 / holdingMonths) - 1.0) * 100m;
                cagr = Math.Round(cagr.Value, 2);
            }

            return new HoldingAnalyticsDto(
                h.Name,
                h.HoldingType.ToString(),
                Math.Round(h.CurrentValue, 2),
                Math.Round(purchased, 2),
                Math.Round(gainLoss, 2),
                gainLossPct,
                cagr,
                holdingMonths);
        })
        .OrderByDescending(h => h.CurrentValue)
        .ToList();

        // Allocation by holding type
        var allocationByType = holdings
            .GroupBy(h => h.HoldingType.ToString())
            .Select(g =>
            {
                var groupValue = g.Sum(h => h.CurrentValue);
                var pct = totalValue > 0 ? Math.Round(groupValue / totalValue * 100m, 2) : 0m;
                return new AllocationByTypeDto(g.Key, Math.Round(groupValue, 2), pct, g.Count());
            })
            .OrderByDescending(a => a.TotalValue)
            .ToList();

        // Top 5 holdings by value (concentration risk)
        var topConcentrations = holdingAnalytics
            .Take(5)
            .Select(h => new ConcentrationRiskDto(
                h.Name,
                h.HoldingType,
                h.CurrentValue,
                totalValue > 0 ? Math.Round(h.CurrentValue / totalValue * 100m, 2) : 0m))
            .ToList();

        return new PortfolioAnalyticsDto(
            Math.Round(totalValue, 2),
            Math.Round(totalPurchased, 2),
            Math.Round(totalGainLoss, 2),
            totalGainLossPct,
            allocationByType,
            topConcentrations,
            holdingAnalytics);
    }
}
