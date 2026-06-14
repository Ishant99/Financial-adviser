namespace FinAdvisor.Application.DTOs;

public record CasImportResult(
    int HoldingsImported,
    int HoldingsUpdated,
    string InvestorName,
    decimal TotalValue,
    Guid UploadLogId);

public record CasUploadLogDto(
    Guid Id,
    DateTimeOffset UploadedAt,
    string FileName,
    int HoldingsImported,
    int HoldingsUpdated,
    string Status,
    string? InvestorName,
    string? ErrorMessage);
