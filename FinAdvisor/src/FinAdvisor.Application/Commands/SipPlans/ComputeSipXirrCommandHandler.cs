using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.SipPlans;

public class ComputeSipXirrCommandHandler(
    ISipPlanRepository sipPlans,
    IHoldingRepository holdings,
    IAnalyticsService analytics)
{
    public async Task<SipPlanDto?> HandleAsync(Guid sipId, CancellationToken ct = default)
    {
        var sip = await sipPlans.GetByIdAsync(sipId, ct);
        if (sip is null) return null;

        var cashFlows = GenerateCashFlows(sip.StartDate, sip.SipDate, sip.MonthlyAmount);

        // Terminal value: find matching holding by fund name (case-insensitive)
        var allHoldings = await holdings.GetAllAsync(ct);
        var match = allHoldings.FirstOrDefault(h =>
            string.Equals(h.Name, sip.FundName, StringComparison.OrdinalIgnoreCase));

        var currentValue = match?.CurrentValue
            ?? cashFlows.Sum(cf => -cf.Amount); // fallback: total invested (XIRR ≈ 0)

        cashFlows.Add(new XirrCashFlow(DateOnly.FromDateTime(DateTime.Today), currentValue));

        if (cashFlows.Count < 2) return null;

        var result = await analytics.ComputeXirrAsync(new XirrRequest(cashFlows), ct);
        var benchmarkXirr = GetBenchmarkAnnualisedReturn(sip.BenchmarkIndex);
        sip.UpdateXirr(result.Xirr, benchmarkXirr);
        await sipPlans.UpdateAsync(sip, ct);

        return ToDto(sip);
    }

    private static List<XirrCashFlow> GenerateCashFlows(DateOnly startDate, int sipDate, decimal monthlyAmount)
    {
        var flows = new List<XirrCashFlow>();
        var today = DateOnly.FromDateTime(DateTime.Today);
        var current = new DateOnly(startDate.Year, startDate.Month, Math.Min(sipDate, DateTime.DaysInMonth(startDate.Year, startDate.Month)));

        while (current <= today)
        {
            flows.Add(new XirrCashFlow(current, -monthlyAmount));
            var next = current.AddMonths(1);
            var day = Math.Min(sipDate, DateTime.DaysInMonth(next.Year, next.Month));
            current = new DateOnly(next.Year, next.Month, day);
        }

        return flows;
    }

    // Long-run annualised returns for common Indian benchmark indices (source: historical data).
    // These are indicative; update periodically as the investment landscape changes.
    private static decimal? GetBenchmarkAnnualisedReturn(string benchmarkIndex) =>
        benchmarkIndex.ToUpperInvariant() switch
        {
            var b when b.Contains("NIFTY 50") || b.Contains("NIFTY50") => 0.12m,
            var b when b.Contains("SENSEX") => 0.12m,
            var b when b.Contains("MIDCAP") => 0.145m,
            var b when b.Contains("SMALLCAP") => 0.15m,
            var b when b.Contains("NIFTY 500") || b.Contains("NIFTY500") => 0.125m,
            var b when b.Contains("LIQUID") || b.Contains("OVERNIGHT") => 0.065m,
            var b when b.Contains("GILT") || b.Contains("G-SEC") => 0.075m,
            var b when b.Contains("CORPORATE BOND") || b.Contains("CORP BOND") => 0.08m,
            _ => null
        };

    internal static SipPlanDto ToDto(Domain.Entities.SipPlan s) => new(
        s.Id, s.FundName, s.FundCode, s.MonthlyAmount, s.SipDate,
        s.StartDate, s.Status.ToString(), s.LinkedGoalId, null,
        s.BenchmarkIndex, s.LatestXirr, s.XirrCalculatedAt, s.BenchmarkXirr);
}
