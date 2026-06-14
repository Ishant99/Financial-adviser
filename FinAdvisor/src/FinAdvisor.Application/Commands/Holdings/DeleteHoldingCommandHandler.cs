using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.Holdings;

public class DeleteHoldingCommandHandler(IHoldingRepository holdingRepo)
{
    public async Task<bool> HandleAsync(Guid id, CancellationToken ct = default)
    {
        var holding = await holdingRepo.GetByIdAsync(id, ct);
        if (holding is null) return false;
        await holdingRepo.DeleteAsync(holding, ct);
        return true;
    }
}
