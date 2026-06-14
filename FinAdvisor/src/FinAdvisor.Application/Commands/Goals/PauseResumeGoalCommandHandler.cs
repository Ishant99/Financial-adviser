using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.Goals;

public class PauseResumeGoalCommandHandler(IGoalRepository goalRepo)
{
    public async Task<GoalDto?> PauseAsync(Guid id, CancellationToken ct = default)
    {
        var goal = await goalRepo.GetByIdAsync(id, ct);
        if (goal is null) return null;
        goal.Pause();
        await goalRepo.UpdateAsync(goal, ct);
        return AddGoalCommandHandler.ToDto(goal);
    }

    public async Task<GoalDto?> ResumeAsync(Guid id, CancellationToken ct = default)
    {
        var goal = await goalRepo.GetByIdAsync(id, ct);
        if (goal is null) return null;
        goal.Resume();
        await goalRepo.UpdateAsync(goal, ct);
        return AddGoalCommandHandler.ToDto(goal);
    }
}
