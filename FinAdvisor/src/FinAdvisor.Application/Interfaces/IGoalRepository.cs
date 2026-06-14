using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Interfaces;

public interface IGoalRepository : IRepository<Goal>
{
    Task<IReadOnlyList<Goal>> GetByStatusAsync(GoalStatus status, CancellationToken ct = default);
    Task<IReadOnlyList<Goal>> GetActiveAsync(CancellationToken ct = default);
}
