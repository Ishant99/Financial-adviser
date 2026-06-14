using FinAdvisor.Application.Commands.SipPlans;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Queries;
using FinAdvisor.Infrastructure.Services;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace FinAdvisor.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SipPlansController(
    GetSipPlansQueryHandler queryHandler,
    AddSipPlanCommandHandler addHandler,
    PauseResumeSipPlanCommandHandler pauseResumeHandler,
    ComputeSipXirrCommandHandler xirrHandler,
    IValidator<AddSipPlanRequest> validator) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken ct) =>
        Ok(await queryHandler.HandleAsync(ct));

    [HttpPost]
    public async Task<IActionResult> Add([FromBody] AddSipPlanRequest req, CancellationToken ct)
    {
        var validation = await validator.ValidateAsync(req, ct);
        if (!validation.IsValid) return ValidationProblem(new ValidationProblemDetails(validation.ToDictionary()));

        var result = await addHandler.HandleAsync(req, ct);
        return CreatedAtAction(nameof(GetAll), result);
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

    [HttpPost("{id:guid}/compute-xirr")]
    public async Task<IActionResult> ComputeXirr(Guid id, CancellationToken ct)
    {
        try
        {
            var result = await xirrHandler.HandleAsync(id, ct);
            return result is null ? NotFound() : Ok(result);
        }
        catch (AnalyticsServiceException ex)
        {
            return StatusCode(502, new { error = ex.Message });
        }
    }
}
