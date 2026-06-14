using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/tax")]
public class TaxController(GetTaxSummaryQueryHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct) =>
        Ok(await handler.HandleAsync(ct));
}
