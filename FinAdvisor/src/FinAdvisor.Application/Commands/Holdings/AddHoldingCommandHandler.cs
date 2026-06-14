using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Holdings;

public class AddHoldingCommandHandler(IHoldingRepository holdingRepo)
{
    public async Task<HoldingDto> HandleAsync(AddHoldingRequest req, CancellationToken ct = default)
    {
        if (!Enum.TryParse<HoldingType>(req.HoldingType, ignoreCase: true, out var holdingType))
            throw new ArgumentException($"Unknown holding type: {req.HoldingType}");

        var holding = Holding.Create(
            req.AccountId, holdingType, req.Name,
            req.Units, req.PurchaseNav, req.CurrentNav, req.AsOf);

        await holdingRepo.AddAsync(holding, ct);

        return new HoldingDto(
            holding.Id, holding.AccountId, holding.HoldingType.ToString(),
            holding.Name, holding.Units, holding.PurchaseNav, holding.CurrentNav,
            holding.CurrentValue,
            holding.PurchaseNav == 0 ? 0m
                : Math.Round((holding.CurrentNav - holding.PurchaseNav) / holding.PurchaseNav * 100m, 2),
            holding.AsOf);
    }
}
