using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NetWorthController(
    GetNetWorthQueryHandler handler,
    GetNetWorthHistoryQueryHandler historyHandler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await handler.HandleAsync(ct));

    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] int months = 12, CancellationToken ct = default) =>
        Ok(await historyHandler.HandleAsync(months, ct));
}
