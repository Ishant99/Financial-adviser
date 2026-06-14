using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetPortfolioAnalyticsQueryHandler(
    IHoldingRepository holdingRepo,
    ITransactionRepository txRepo)
{
    // India 10-year G-Sec risk-free rate used for Sharpe ratio calculation.
    private const decimal RiskFreeRate = 0.07m;

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

        var holdingAnalytics = holdings.Select(h =>
        {
            var purchased     = h.PurchaseNav * h.Units;
            var gainLoss      = h.CurrentValue - purchased;
            var gainLossPct   = purchased > 0 ? Math.Round(gainLoss / purchased * 100m, 2) : 0m;

            var asOfDate      = DateOnly.FromDateTime(h.AsOf.LocalDateTime);
            var holdingMonths = Math.Max(0,
                (today.Year - asOfDate.Year) * 12 + today.Month - asOfDate.Month);

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
                holdingMonths,
                h.Sector,
                h.MarketCapCategory);
        })
        .OrderByDescending(h => h.CurrentValue)
        .ToList();

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

        var allocationBySector = holdings
            .Where(h => h.Sector is not null)
            .GroupBy(h => h.Sector!)
            .Select(g =>
            {
                var groupValue = g.Sum(h => h.CurrentValue);
                var pct = totalValue > 0 ? Math.Round(groupValue / totalValue * 100m, 2) : 0m;
                return new AllocationByGroupDto(g.Key, Math.Round(groupValue, 2), pct, g.Count());
            })
            .OrderByDescending(a => a.TotalValue)
            .ToList();

        var allocationByMarketCap = holdings
            .Where(h => h.MarketCapCategory is not null)
            .GroupBy(h => h.MarketCapCategory!)
            .Select(g =>
            {
                var groupValue = g.Sum(h => h.CurrentValue);
                var pct = totalValue > 0 ? Math.Round(groupValue / totalValue * 100m, 2) : 0m;
                return new AllocationByGroupDto(g.Key, Math.Round(groupValue, 2), pct, g.Count());
            })
            .OrderByDescending(a => a.TotalValue)
            .ToList();

        var topConcentrations = holdingAnalytics
            .Take(5)
            .Select(h => new ConcentrationRiskDto(
                h.Name,
                h.HoldingType,
                h.CurrentValue,
                totalValue > 0 ? Math.Round(h.CurrentValue / totalValue * 100m, 2) : 0m))
            .ToList();

        var sharpeRatio = await ComputeSharpeRatioAsync(ct);

        return new PortfolioAnalyticsDto(
            Math.Round(totalValue, 2),
            Math.Round(totalPurchased, 2),
            Math.Round(totalGainLoss, 2),
            totalGainLossPct,
            allocationByType,
            topConcentrations,
            holdingAnalytics,
            allocationBySector,
            allocationByMarketCap,
            sharpeRatio);
    }

    // Sharpe = (annualised_return - risk_free_rate) / annualised_std_dev
    // Computed from 12 months of reconstructed monthly net-worth returns.
    private async Task<decimal?> ComputeSharpeRatioAsync(CancellationToken ct)
    {
        var toDate   = DateOnly.FromDateTime(DateTime.Today);
        var fromDate = toDate.AddMonths(-13);

        var txns = await txRepo.GetByDateRangeAsync(fromDate, toDate, ct);
        if (!txns.Any()) return null;

        var holdings = await holdingRepo.GetAllAsync(ct);
        var currentNetWorth = holdings.Sum(h => h.CurrentValue);

        var netByMonth = txns
            .GroupBy(t => (t.Date.Year, t.Date.Month))
            .ToDictionary(
                g => g.Key,
                g => g.Sum(t => t.TransactionType == Domain.Enums.TransactionType.Credit
                    ? (double)t.Amount : -(double)t.Amount));

        // Reconstruct ~12 monthly portfolio values walking backwards
        var monthlyValues = new List<double>(13);
        var runningValue = (double)currentNetWorth;

        for (int i = 0; i < 13; i++)
        {
            var date = toDate.AddMonths(-i);
            monthlyValues.Add(Math.Max(0, runningValue));

            if (i < 12)
            {
                var net = netByMonth.GetValueOrDefault((date.Year, date.Month), 0);
                runningValue -= net;
            }
        }

        monthlyValues.Reverse();

        // Monthly returns
        var monthlyReturns = new List<double>();
        for (int i = 1; i < monthlyValues.Count; i++)
        {
            if (monthlyValues[i - 1] > 0)
                monthlyReturns.Add((monthlyValues[i] - monthlyValues[i - 1]) / monthlyValues[i - 1]);
        }

        if (monthlyReturns.Count < 3) return null;

        var meanMonthly = monthlyReturns.Average();
        var variance    = monthlyReturns.Sum(r => Math.Pow(r - meanMonthly, 2)) / monthlyReturns.Count;
        var stdDev      = Math.Sqrt(variance);

        if (stdDev < 1e-9) return null;

        var annualisedReturn = Math.Pow(1 + meanMonthly, 12) - 1;
        var annualisedStdDev = stdDev * Math.Sqrt(12);
        var sharpe = (annualisedReturn - (double)RiskFreeRate) / annualisedStdDev;

        return Math.Round((decimal)sharpe, 2);
    }
}
