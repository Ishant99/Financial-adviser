using FinAdvisor.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/dev")]
public class DevController(
    ResetDataService resetService,
    IHostEnvironment env) : ControllerBase
{
    /// <summary>
    /// Wipes all data and re-seeds with development defaults.
    /// Only works in the Development environment.
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> Reset(CancellationToken ct)
    {
        if (!env.IsDevelopment())
            return NotFound();

        await resetService.ResetAsync(ct);
        return Ok(new { message = "Data reset complete. Seed data restored." });
    }
}
