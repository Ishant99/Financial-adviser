using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Queries;

public class GetTaxSummaryQueryHandler(
    IHoldingRepository holdingRepo,
    ISipPlanRepository sipPlanRepo)
{
    // Indian LTCG: equity funds held > 12 months, 10% above ₹1 lakh exemption
    // Indian STCG: equity funds held ≤ 12 months, 15%
    // Section 80C ELSS deduction limit: ₹1,50,000 per year
    private const decimal LtcgExemptionLimit = 100_000m;
    private const decimal LtcgRate = 0.10m;
    private const decimal StcgRate = 0.15m;
    private const decimal Section80CLimit = 150_000m;

    public async Task<TaxSummaryDto> HandleAsync(CancellationToken ct = default)
    {
        var holdings = await holdingRepo.GetAllAsync(ct);
        var sips     = await sipPlanRepo.GetAllAsync(ct);

        var today = DateOnly.FromDateTime(DateTime.Today);

        // Current Indian financial year (April 1 – March 31)
        var fyStart = today.Month >= 4
            ? new DateOnly(today.Year, 4, 1)
            : new DateOnly(today.Year - 1, 4, 1);
        var fyEnd   = fyStart.AddYears(1).AddDays(-1);
        var fyLabel = $"FY {fyStart.Year}-{(fyStart.Year + 1) % 100:D2}";

        // Section 80C: sum of SIP monthly contributions that fall within the FY
        // Note: Only ELSS funds qualify; we approximate by summing all SIP commitments,
        // capped at the statutory ₹1.5L limit.
        decimal grossSection80C = 0m;
        foreach (var sip in sips)
        {
            var sipStart = sip.StartDate > fyStart ? sip.StartDate : fyStart;
            var sipEnd   = today < fyEnd ? today : fyEnd;
            if (sipStart > sipEnd) continue;

            var sipMonths = Math.Max(0,
                (sipEnd.Year - sipStart.Year) * 12 + sipEnd.Month - sipStart.Month + 1);
            grossSection80C += sip.MonthlyAmount * sipMonths;
        }
        var totalInvestedSection80C = Math.Min(grossSection80C, Section80CLimit);

        // Holdings tax analysis
        // Uses AsOf date as the acquisition-date proxy.
        // In production, per-transaction purchase dates would be used instead.
        decimal ltcgGains = 0m;
        decimal stcgGains = 0m;
        var taxHoldings = new List<TaxHoldingDto>();

        foreach (var h in holdings)
        {
            // Skip non-taxable or zero-cost holdings
            if (h.PurchaseNav <= 0 || h.HoldingType is HoldingType.Cash)
                continue;

            var gainLoss = (h.CurrentNav - h.PurchaseNav) * h.Units;
            var asOfDate = DateOnly.FromDateTime(h.AsOf.LocalDateTime);
            var holdingMonths = Math.Max(0,
                (today.Year - asOfDate.Year) * 12 + today.Month - asOfDate.Month);

            string taxCategory;
            if (h.HoldingType == HoldingType.FD)
            {
                // FD interest is taxed at slab rate; show as "Slab" category
                taxCategory = "Slab";
            }
            else if (holdingMonths > 12)
            {
                taxCategory = "LTCG";
                if (gainLoss > 0) ltcgGains += gainLoss;
            }
            else
            {
                taxCategory = "STCG";
                if (gainLoss > 0) stcgGains += gainLoss;
            }

            taxHoldings.Add(new TaxHoldingDto(
                h.Name,
                asOfDate.ToString("yyyy-MM-dd", System.Globalization.CultureInfo.InvariantCulture),
                h.CurrentValue,
                Math.Round(gainLoss, 2),
                holdingMonths,
                taxCategory));
        }

        // LTCG tax: 10% on gains above ₹1 lakh exemption
        var estimatedLtcgTax = ltcgGains > LtcgExemptionLimit
            ? Math.Round((ltcgGains - LtcgExemptionLimit) * LtcgRate, 2)
            : 0m;

        // STCG tax: flat 15%
        var estimatedStcgTax = Math.Round(stcgGains * StcgRate, 2);

        return new TaxSummaryDto(
            fyLabel,
            Math.Round(ltcgGains, 2),
            Math.Round(stcgGains, 2),
            estimatedLtcgTax,
            estimatedStcgTax,
            Math.Round(totalInvestedSection80C, 2),
            taxHoldings
                .OrderByDescending(h => Math.Abs(h.GainLoss))
                .ToList());
    }
}
