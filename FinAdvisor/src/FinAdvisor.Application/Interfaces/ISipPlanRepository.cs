using FinAdvisor.Domain.Entities;

namespace FinAdvisor.Application.Interfaces;

public interface ISipPlanRepository : IRepository<SipPlan>
{
    Task<IReadOnlyList<SipPlan>> GetActiveAsync(CancellationToken ct = default);
    Task<SipPlan?> GetByFundCodeAsync(string fundCode, CancellationToken ct = default);
}
