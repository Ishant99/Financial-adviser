using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;

namespace FinAdvisor.Application.Commands.SipPlans;

public class AddSipPlanCommandHandler(ISipPlanRepository sipRepo)
{
    public async Task<SipPlanDto> HandleAsync(AddSipPlanRequest req, CancellationToken ct = default)
    {
        var sip = SipPlan.Create(
            req.FundName, req.FundCode, req.MonthlyAmount,
            req.SipDate, req.StartDate, req.BenchmarkIndex, req.LinkedGoalId);

        await sipRepo.AddAsync(sip, ct);

        return new SipPlanDto(
            sip.Id, sip.FundName, sip.FundCode, sip.MonthlyAmount, sip.SipDate,
            sip.StartDate, sip.Status.ToString(), sip.LinkedGoalId, null,
            sip.BenchmarkIndex, sip.LatestXirr, sip.XirrCalculatedAt, sip.BenchmarkXirr);
    }
}
