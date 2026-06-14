using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetHoldingsQueryHandler(IHoldingRepository holdingRepo)
{
    public async Task<IReadOnlyList<HoldingDto>> HandleAsync(CancellationToken ct = default)
    {
        var holdings = await holdingRepo.GetAllAsync(ct);

        return holdings.Select(h => new HoldingDto(
            h.Id,
            h.AccountId,
            h.HoldingType.ToString(),
            h.Name,
            h.Units,
            h.PurchaseNav,
            h.CurrentNav,
            h.CurrentValue,
            h.PurchaseNav == 0 ? 0m
                : Math.Round((h.CurrentNav - h.PurchaseNav) / h.PurchaseNav * 100m, 2),
            h.AsOf)).ToList();
    }
}
