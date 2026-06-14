using FinAdvisor.Application.Commands.Transactions;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Queries;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionsController(
    GetTransactionsQueryHandler queryHandler,
    AddTransactionCommandHandler addHandler,
    UpdateTransactionCommandHandler updateHandler,
    DeleteTransactionCommandHandler deleteHandler,
    IValidator<AddTransactionRequest> validator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? accountId,
        [FromQuery] DateOnly? from,
        [FromQuery] DateOnly? to,
        CancellationToken ct) =>
        Ok(await queryHandler.HandleAsync(accountId, from, to, ct));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddTransactionRequest req, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(req, ct);
        if (!validation.IsValid) return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

        var result = await addHandler.HandleAsync(req, ct);
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTransactionRequest req, CancellationToken ct)
    {
        try
        {
            var result = await updateHandler.HandleAsync(id, req, ct);
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        try
        {
            await deleteHandler.HandleAsync(id, ct);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
