using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/cashflow")]
public class CashFlowController(GetCashFlowQueryHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] int months = 6,
        CancellationToken ct = default) =>
        Ok(await handler.HandleAsync(Math.Clamp(months, 1, 24), ct));
}
