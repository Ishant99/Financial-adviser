using FinAdvisor.Application.Commands.Holdings;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HoldingsController(
    GetHoldingsQueryHandler queryHandler,
    AddHoldingCommandHandler addHandler,
    UpdateHoldingCommandHandler updateHandler,
    DeleteHoldingCommandHandler deleteHandler,
    IValidator<AddHoldingRequest> addValidator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await queryHandler.HandleAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddHoldingRequest req, CancellationToken ct)
    {
        var validation = await addValidator.ValidateAsync(req, ct);
        if (!validation.IsValid) return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

        var result = await addHandler.HandleAsync(req, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHoldingRequest req, CancellationToken ct)
    {
        var result = await updateHandler.HandleAsync(id, req, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var deleted = await deleteHandler.HandleAsync(id, ct);
        return deleted ? NoContent() : NotFound();
    }
}
