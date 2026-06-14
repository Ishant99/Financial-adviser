using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Transactions;

public class UpdateTransactionCommandHandler(ITransactionRepository txRepo)
{
    public async Task<TransactionDto> HandleAsync(
        Guid id,
        UpdateTransactionRequest req,
        CancellationToken ct = default)
    {
        var tx = await txRepo.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Transaction {id} not found");

        if (!Enum.TryParse<TransactionType>(req.TransactionType, ignoreCase: true, out var txType))
            throw new ArgumentException($"Unknown transaction type: {req.TransactionType}");

        tx.Update(req.Date, req.Amount, txType, req.Category, req.Description);
        await txRepo.UpdateAsync(tx, ct);

        return new TransactionDto(
            tx.Id, tx.AccountId, tx.Date, tx.Amount,
            tx.TransactionType.ToString(), tx.Category, tx.Description, tx.IsReconciled);
    }
}
