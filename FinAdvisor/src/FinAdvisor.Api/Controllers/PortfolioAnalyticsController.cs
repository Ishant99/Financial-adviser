using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public class PortfolioAnalyticsController(GetPortfolioAnalyticsQueryHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await handler.HandleAsync(ct));
}
