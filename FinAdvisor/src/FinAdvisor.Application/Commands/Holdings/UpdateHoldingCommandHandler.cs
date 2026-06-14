using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.Holdings;

public class UpdateHoldingCommandHandler(IHoldingRepository holdingRepo)
{
    public async Task<HoldingDto?> HandleAsync(Guid id, UpdateHoldingRequest req, CancellationToken ct = default)
    {
        var holding = await holdingRepo.GetByIdAsync(id, ct);
        if (holding is null) return null;

        holding.UpdateNav(req.CurrentNav, req.AsOf);
        if (req.PurchaseDate.HasValue)
            holding.SetPurchaseDate(req.PurchaseDate.Value);
        await holdingRepo.UpdateAsync(holding, ct);

        return new HoldingDto(
            holding.Id, holding.AccountId, holding.HoldingType.ToString(),
            holding.Name, holding.Units, holding.PurchaseNav, holding.CurrentNav,
            holding.CurrentValue,
            holding.PurchaseNav == 0 ? 0m
                : Math.Round((holding.CurrentNav - holding.PurchaseNav) / holding.PurchaseNav * 100m, 2),
            holding.AsOf, holding.PurchaseDate);
    }
}
