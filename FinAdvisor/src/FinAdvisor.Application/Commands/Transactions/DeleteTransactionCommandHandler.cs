using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Commands.Transactions;

public class DeleteTransactionCommandHandler(ITransactionRepository txRepo)
{
    public async Task HandleAsync(Guid id, CancellationToken ct = default)
    {
        var tx = await txRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Transaction {id} not found");
        await txRepo.DeleteAsync(tx, ct);
    }
}
