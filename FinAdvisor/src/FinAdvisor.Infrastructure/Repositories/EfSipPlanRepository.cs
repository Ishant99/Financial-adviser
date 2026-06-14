using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfSipPlanRepository(AppDbContext db)
    : EfRepository<SipPlan>(db), ISipPlanRepository
{
    public async Task<IReadOnlyList<SipPlan>> GetActiveAsync(CancellationToken ct = default) =>
        await Db.SipPlans.Where(s => s.Status == SipStatus.Active).ToListAsync(ct);

    public async Task<SipPlan?> GetByFundCodeAsync(string fundCode, CancellationToken ct = default) =>
        await Db.SipPlans.FirstOrDefaultAsync(s => s.FundCode == fundCode, ct);
}
