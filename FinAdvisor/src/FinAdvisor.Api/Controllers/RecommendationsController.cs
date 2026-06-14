using FinAdvisor.Application.Commands.Recommendations;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Application.Queries;
using FinAdvisor.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/recommendations")]
public class RecommendationsController(
    GetRecommendationsQueryHandler getHandler,
    GenerateRecommendationsCommandHandler generateHandler,
    IRecommendationRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetRecent(
        [FromQuery] int limit = 10,
        CancellationToken ct = default)
    {
        var result = await getHandler.HandleAsync(limit, ct);
        return Ok(result);
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(CancellationToken ct)
    {
        try
        {
            var result = await generateHandler.HandleAsync(ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex) when (ex.Message.Contains("503"))
        {
            return StatusCode(503, new { error = ex.Message });
        }
    }

    [HttpPatch("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        var rec = await repository.GetByIdAsync(id, ct);
        if (rec is null) return NotFound();

        rec.MarkRead();
        await repository.UpdateAsync(rec, ct);
        return NoContent();
    }
}
