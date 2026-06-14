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
        sip.UpdateXirr(result.Xirr);
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

    internal static SipPlanDto ToDto(Domain.Entities.SipPlan s) => new(
        s.Id, s.FundName, s.FundCode, s.MonthlyAmount, s.SipDate,
        s.StartDate, s.Status.ToString(), s.LinkedGoalId, null,
        s.BenchmarkIndex, s.LatestXirr, s.XirrCalculatedAt);
}
