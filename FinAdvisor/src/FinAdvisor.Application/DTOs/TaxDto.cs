namespace FinAdvisor.Application.DTOs;

public record TaxHoldingDto(
    string Name,
    string PurchaseDate,
    decimal CurrentValue,
    decimal GainLoss,
    int HoldingMonths,
    string TaxCategory);   // "LTCG" | "STCG" | "Exempt"

public record TaxSummaryDto(
    string FinancialYear,
    decimal LtcgGains,
    decimal StcgGains,
    decimal EstimatedLtcgTax,
    decimal EstimatedStcgTax,
    decimal TotalInvestedSection80C,
    IReadOnlyList<TaxHoldingDto> Holdings);
