using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Services;

namespace FinAdvisor.Application.Queries;

public class GetNetWorthQueryHandler(IHoldingRepository holdingRepo)
{
    public async Task<NetWorthDto> HandleAsync(CancellationToken ct = default)
    {
        var holdings = await holdingRepo.GetAllAsync(ct);

        var netWorth = NetWorthCalculator.Calculate(holdings);
        var breakdown = NetWorthCalculator.BreakdownByType(holdings);

        var total = netWorth.Amount == 0 ? 1m : netWorth.Amount;

        var categories = breakdown
            .Select(kv => new NetWorthCategoryDto(
                kv.Key.ToString(),
                kv.Value.Amount,
                total == 0 ? 0m : Math.Round(kv.Value.Amount / total * 100m, 1)))
            .OrderByDescending(c => c.Value)
            .ToList();

        return new NetWorthDto(netWorth.Amount, "INR", DateTimeOffset.UtcNow, categories);
    }
}
