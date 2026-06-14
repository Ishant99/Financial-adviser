using FinAdvisor.Application.Commands.Plan;
using FinAdvisor.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/plan")]
public class PlanController(GenerateMonthlyPlanCommandHandler handler) : ControllerBase
{
    [HttpPost("generate")]
    public async Task<IActionResult> Generate(CancellationToken ct)
    {
        try
        {
            var result = await handler.HandleAsync(ct);
            return Ok(result);
        }
        catch (AnalyticsServiceException ex) when (ex.Message.Contains("503"))
        {
            return StatusCode(503, new { error = ex.Message });
        }
    }
}
