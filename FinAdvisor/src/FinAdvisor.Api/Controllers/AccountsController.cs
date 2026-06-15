using FinAdvisor.Application.Commands.Accounts;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Queries;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AccountsController(
    GetAccountsQueryHandler getHandler,
    CreateAccountCommandHandler createHandler) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await getHandler.HandleAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AddAccountRequest req, CancellationToken ct)
    {
        var dto = await createHandler.HandleAsync(req, ct);
        return CreatedAtAction(nameof(GetAll), new { id = dto.Id }, dto);
    }
}
