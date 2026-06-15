using FinAdvisor.Application.Commands.Upload;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/upload")]
public class UploadController(
    IAnalyticsService analytics,
    ImportCasHoldingsCommandHandler importHandler,
    ImportBankStatementCommandHandler importBankHandler,
    ImportBrokerHoldingsCommandHandler importBrokerHandler,
    BulkImportSipsCommandHandler importSipsHandler,
    ILogger<UploadController> logger) : ControllerBase
{
    [HttpPost("cas")]
    [RequestSizeLimit(10 * 1024 * 1024)] // 10 MB
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<CasImportResult>> UploadCas(
        IFormFile file,
        [FromForm] string? password,
        [FromForm] Guid accountId,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");
        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only PDF files are accepted.");
        if (accountId == Guid.Empty)
            return BadRequest("accountId is required.");

        try
        {
            await using var stream = file.OpenReadStream();
            var parsed = await analytics.ParseCasAsync(stream, password, ct);
            var result = await importHandler.HandleAsync(parsed, accountId, file.FileName, ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            logger.LogWarning(ex, "CAS parse failed for {FileName}", file.FileName);
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during CAS upload for {FileName}", file.FileName);
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("sips")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<SipBulkImportResult>> UploadSips(
        IFormFile file,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0) return BadRequest("No file uploaded.");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".xlsx" or ".xls" or ".csv"))
            return BadRequest("Only Excel (.xlsx) or CSV (.csv) files are accepted.");

        try
        {
            await using var stream = file.OpenReadStream();
            var parsed = await analytics.ParseSipExportAsync(stream, file.FileName, ct);
            var result = await importSipsHandler.HandleAsync(parsed, ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            logger.LogWarning(ex, "SIP import parse failed for {FileName}", file.FileName);
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during SIP import for {FileName}", file.FileName);
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("broker-holdings")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<HoldingsImportResult>> UploadBrokerHoldings(
        IFormFile file,
        [FromForm] Guid accountId,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (ext is not (".xlsx" or ".xls" or ".csv"))
            return BadRequest("Only Excel (.xlsx) or CSV (.csv) files are accepted.");
        if (accountId == Guid.Empty)
            return BadRequest("accountId is required.");

        try
        {
            await using var stream = file.OpenReadStream();
            var parsed = await analytics.ParseHoldingsExportAsync(stream, file.FileName, ct);
            var result = await importBrokerHandler.HandleAsync(parsed, accountId, ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            logger.LogWarning(ex, "Broker holdings parse failed for {FileName}", file.FileName);
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during broker holdings upload for {FileName}", file.FileName);
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpPost("bank-statement")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<BankStatementImportResult>> UploadBankStatement(
        IFormFile file,
        [FromForm] string? password,
        [FromForm] Guid accountId,
        CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file uploaded.");
        if (!file.FileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            return BadRequest("Only PDF files are accepted.");
        if (accountId == Guid.Empty)
            return BadRequest("accountId is required.");

        try
        {
            await using var stream = file.OpenReadStream();
            var parsed = await analytics.ParseBankStatementAsync(stream, password, ct);
            var result = await importBankHandler.HandleAsync(parsed, accountId, ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            logger.LogWarning(ex, "Bank statement parse failed for {FileName}", file.FileName);
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unexpected error during bank statement upload for {FileName}", file.FileName);
            return StatusCode(500, new { error = "An unexpected error occurred." });
        }
    }

    [HttpGet("history")]
    public async Task<ActionResult<IReadOnlyList<CasUploadLogDto>>> GetHistory(
        [FromServices] FinAdvisor.Application.Interfaces.IRepository<FinAdvisor.Domain.Entities.CasUploadLog> uploadLogs,
        CancellationToken ct)
    {
        var logs = await uploadLogs.GetAllAsync(ct);
        var dtos = logs
            .OrderByDescending(l => l.UploadedAt)
            .Take(20)
            .Select(l => new CasUploadLogDto(
                l.Id, l.UploadedAt, l.FileName,
                l.HoldingsImported, l.HoldingsUpdated,
                l.Status, l.InvestorName, l.ErrorMessage))
            .ToList();
        return Ok(dtos);
    }
}
