namespace FinAdvisor.Application.DTOs;

public record BankTransactionResult(
    string Date,       // ISO YYYY-MM-DD
    string Description,
    decimal? Debit,
    decimal? Credit,
    decimal? Balance,
    string Category);

public record BankStatementParseResult(
    string BankName,
    string? AccountNumber,
    string? PeriodFrom,
    string? PeriodTo,
    decimal? OpeningBalance,
    IReadOnlyList<BankTransactionResult> Transactions);

public record BankStatementImportResult(
    int Imported,
    int Updated,
    int Skipped,
    string BankName,
    string? AccountNumber,
    string? PeriodFrom,
    string? PeriodTo);
