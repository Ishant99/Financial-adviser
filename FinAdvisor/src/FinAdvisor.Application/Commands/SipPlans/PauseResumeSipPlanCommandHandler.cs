using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.SipPlans;

public class PauseResumeSipPlanCommandHandler(ISipPlanRepository sipRepo)
{
    public async Task<SipPlanDto?> PauseAsync(Guid id, CancellationToken ct = default)
    {
        var sip = await sipRepo.GetByIdAsync(id, ct);
        if (sip is null) return null;
        sip.Pause();
        await sipRepo.UpdateAsync(sip, ct);
        return ToDto(sip);
    }

    public async Task<SipPlanDto?> ResumeAsync(Guid id, CancellationToken ct = default)
    {
        var sip = await sipRepo.GetByIdAsync(id, ct);
        if (sip is null) return null;
        sip.Resume();
        await sipRepo.UpdateAsync(sip, ct);
        return ToDto(sip);
    }

    private static SipPlanDto ToDto(Domain.Entities.SipPlan s) => new(
        s.Id, s.FundName, s.FundCode, s.MonthlyAmount, s.SipDate,
        s.StartDate, s.Status.ToString(), s.LinkedGoalId, null,
        s.BenchmarkIndex, s.LatestXirr, s.XirrCalculatedAt);
}
