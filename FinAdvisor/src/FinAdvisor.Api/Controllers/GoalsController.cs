using FinAdvisor.Application.Commands.Goals;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Queries;
using FinAdvisor.Infrastructure.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GoalsController(
    GetGoalsQueryHandler queryHandler,
    AddGoalCommandHandler addHandler,
    UpdateGoalCommandHandler updateHandler,
    PauseResumeGoalCommandHandler pauseResumeHandler,
    RecalculateGoalProbabilityCommandHandler simulateHandler,
    IValidator<AddGoalRequest> addValidator,
    IValidator<UpdateGoalRequest> updateValidator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await queryHandler.HandleAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await queryHandler.HandleAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddGoalRequest req, CancellationToken ct)
    {
        var validation = await addValidator.ValidateAsync(req, ct);
        if (!validation.IsValid) return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

        var result = await addHandler.HandleAsync(req, ct);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateGoalRequest req, CancellationToken ct)
    {
        var validation = await updateValidator.ValidateAsync(req, ct);
        if (!validation.IsValid) return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

        var result = await updateHandler.HandleAsync(id, req, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}/pause")]
    public async Task<IActionResult> Pause(Guid id, CancellationToken ct)
    {
        var result = await pauseResumeHandler.PauseAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPatch("{id:guid}/resume")]
    public async Task<IActionResult> Resume(Guid id, CancellationToken ct)
    {
        var result = await pauseResumeHandler.ResumeAsync(id, ct);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost("{id:guid}/simulate")]
    public async Task<IActionResult> Simulate(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await simulateHandler.HandleAsync(id, ct);
            return result is null ? NotFound() : Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }
}
