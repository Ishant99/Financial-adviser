using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetSipPlansQueryHandler(ISipPlanRepository sipRepo, IGoalRepository goalRepo)
{
    public async Task<IReadOnlyList<SipPlanDto>> HandleAsync(CancellationToken ct = default)
    {
        var sips = await sipRepo.GetAllAsync(ct);
        var goals = await goalRepo.GetAllAsync(ct);
        var goalNames = goals.ToDictionary(g => g.Id, g => g.Name);

        return sips.Select(s => new SipPlanDto(
            s.Id, s.FundName, s.FundCode, s.MonthlyAmount, s.SipDate,
            s.StartDate, s.Status.ToString(),
            s.LinkedGoalId,
            s.LinkedGoalId.HasValue ? goalNames.GetValueOrDefault(s.LinkedGoalId.Value) : null,
            s.BenchmarkIndex, s.LatestXirr, s.XirrCalculatedAt)).ToList();
    }
}
