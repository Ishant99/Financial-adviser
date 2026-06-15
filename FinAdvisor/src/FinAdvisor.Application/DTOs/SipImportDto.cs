namespace FinAdvisor.Application.DTOs;

public record ImportedSipResult(
    string FundName,
    string FundCode,
    decimal MonthlyAmount,
    int SipDate,
    string StartDate,
    string BenchmarkIndex,
    string Status);

public record SipImportParseResult(
    string Source,
    IReadOnlyList<ImportedSipResult> Sips);

public record SipBulkImportResult(
    int Imported,
    int Skipped,
    string Source);
