using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController(GetAccountsQueryHandler handler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await handler.HandleAsync(ct));
}
