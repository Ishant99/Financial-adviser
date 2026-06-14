namespace FinAdvisor.Application.DTOs;

public record CasParseResult(
    string InvestorName,
    string StatementDate,
    decimal TotalValue,
    IReadOnlyList<CasHoldingResult> Holdings);

public record CasHoldingResult(
    string FundName,
    string FundCode,
    decimal Units,
    decimal Nav,
    decimal Value,
    string Folio,
    string? Isin);
