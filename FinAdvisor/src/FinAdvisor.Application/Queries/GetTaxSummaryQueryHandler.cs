using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Queries;

public class GetTaxSummaryQueryHandler(
    IHoldingRepository holdingRepo,
    ISipPlanRepository sipPlanRepo)
{
    // Indian equity fund tax rules effective 23 July 2024 (Finance Act 2024).
    // LTCG: gains on equity/equity-oriented funds held > 12 months, 12.5% above Rs 1.25 lakh exemption.
    // STCG: gains on equity/equity-oriented funds held <= 12 months, flat 20%.
    // Debt funds (held any period): taxed at income slab rate — classified separately.
    // Section 80C ELSS SIP deduction limit unchanged at Rs 1,50,000/year.
    // Source: CBDT circular dated 23-Jul-2024; applies from FY 2024-25 onwards.
    private const decimal LtcgExemptionLimit = 125_000m;  // Rs 1.25L (was Rs 1L pre Jul-2024)
    private const decimal LtcgRate = 0.125m;              // 12.5% (was 10% pre Jul-2024)
    private const decimal StcgRate = 0.20m;               // 20%   (was 15% pre Jul-2024)
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

        // Holdings tax analysis.
        // LTCG/STCG classification REQUIRES a real purchase date. When PurchaseDate is null
        // (e.g. broker exports like Groww that omit the buy date, or manual rows left blank),
        // we DO NOT guess. Previously the code fell back to AsOf (the NAV/import date), which
        // made every imported holding look <12 months old and wrongly taxed everything as STCG.
        // Per the project rule "the rules engine never produces wrong numbers", such holdings
        // are reported as "Unknown" and excluded from the tax totals until the user sets a date.
        decimal ltcgGains = 0m;
        decimal stcgGains = 0m;
        var taxHoldings = new List<TaxHoldingDto>();

        foreach (var h in holdings)
        {
            // Skip non-taxable or zero-cost holdings
            if (h.PurchaseNav <= 0 || h.HoldingType is HoldingType.Cash)
                continue;

            var gainLoss = (h.CurrentNav - h.PurchaseNav) * h.Units;

            string taxCategory;
            int holdingMonths;
            string acquisitionLabel;

            if (h.HoldingType == HoldingType.FD)
            {
                // FD interest is taxed at slab rate; gains/duration not classified as LTCG/STCG.
                taxCategory = "Slab";
                holdingMonths = h.PurchaseDate is { } fdDate
                    ? Math.Max(0, (today.Year - fdDate.Year) * 12 + today.Month - fdDate.Month)
                    : 0;
                acquisitionLabel = h.PurchaseDate?.ToString("yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture) ?? "";
            }
            else if (h.PurchaseDate is null)
            {
                // No reliable purchase date — do not fabricate a classification or tax.
                taxCategory = "Unknown";
                holdingMonths = 0;
                acquisitionLabel = "";
            }
            else
            {
                var acquisitionDate = h.PurchaseDate.Value;
                holdingMonths = Math.Max(0,
                    (today.Year - acquisitionDate.Year) * 12 + today.Month - acquisitionDate.Month);
                acquisitionLabel = acquisitionDate.ToString("yyyy-MM-dd",
                    System.Globalization.CultureInfo.InvariantCulture);

                if (holdingMonths > 12)
                {
                    taxCategory = "LTCG";
                    if (gainLoss > 0) ltcgGains += gainLoss;
                }
                else
                {
                    taxCategory = "STCG";
                    if (gainLoss > 0) stcgGains += gainLoss;
                }
            }

            taxHoldings.Add(new TaxHoldingDto(
                h.Name,
                acquisitionLabel,
                h.CurrentValue,
                Math.Round(gainLoss, 2),
                holdingMonths,
                taxCategory));
        }

        // LTCG tax: 12.5% on gains above ₹1.25 lakh exemption (Finance Act 2024)
        var estimatedLtcgTax = ltcgGains > LtcgExemptionLimit
            ? Math.Round((ltcgGains - LtcgExemptionLimit) * LtcgRate, 2)
            : 0m;

        // STCG tax: flat 20% (Finance Act 2024)
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
