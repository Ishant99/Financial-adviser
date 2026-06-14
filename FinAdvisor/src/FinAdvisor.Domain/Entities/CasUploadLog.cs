namespace FinAdvisor.Domain.Entities;

public class CasUploadLog
{
    public Guid Id { get; private set; }
    public DateTimeOffset UploadedAt { get; private set; }
    public string FileName { get; private set; } = string.Empty;
    public int HoldingsImported { get; private set; }
    public int HoldingsUpdated { get; private set; }
    public string Status { get; private set; } = string.Empty;
    public string? InvestorName { get; private set; }
    public string? ErrorMessage { get; private set; }

    private CasUploadLog() { }

    public static CasUploadLog CreateSuccess(
        string fileName, int imported, int updated, string? investorName) =>
        new()
        {
            Id = Guid.NewGuid(),
            UploadedAt = DateTimeOffset.UtcNow,
            FileName = fileName,
            HoldingsImported = imported,
            HoldingsUpdated = updated,
            Status = "Success",
            InvestorName = investorName,
        };

    public static CasUploadLog CreateFailed(string fileName, string errorMessage) =>
        new()
        {
            Id = Guid.NewGuid(),
            UploadedAt = DateTimeOffset.UtcNow,
            FileName = fileName,
            HoldingsImported = 0,
            HoldingsUpdated = 0,
            Status = "Failed",
            ErrorMessage = errorMessage,
        };
}
