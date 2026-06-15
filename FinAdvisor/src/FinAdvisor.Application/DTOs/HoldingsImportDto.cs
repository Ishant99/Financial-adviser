namespace FinAdvisor.Application.DTOs;

public record ImportedHoldingResult(
    string SchemeName,
    string? Amc,
    string? Category,
    string? SubCategory,
    string? Folio,
    decimal Units,
    decimal InvestedValue,
    decimal CurrentValue,
    decimal PurchaseNav,
    decimal CurrentNav,
    decimal? Xirr);

public record HoldingsImportParseResult(
    string Source,
    string? AsOfDate,
    decimal TotalInvested,
    decimal TotalCurrentValue,
    IReadOnlyList<ImportedHoldingResult> Holdings);

public record HoldingsImportResult(
    int Imported,
    int Updated,
    int Skipped,
    string Source,
    decimal TotalCurrentValue);
