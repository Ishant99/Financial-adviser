using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Transactions;

public class AddTransactionCommandHandler(ITransactionRepository txRepo)
{
    public async Task<TransactionDto> HandleAsync(AddTransactionRequest req, CancellationToken ct = default)
    {
        if (!Enum.TryParse<TransactionType>(req.TransactionType, ignoreCase: true, out var txType))
            throw new ArgumentException($"Unknown transaction type: {req.TransactionType}");

        var tx = Transaction.Create(
            req.AccountId, req.Date, req.Amount, txType, req.Category, req.Description);

        await txRepo.AddAsync(tx, ct);

        return new TransactionDto(
            tx.Id, tx.AccountId, tx.Date, tx.Amount,
            tx.TransactionType.ToString(), tx.Category, tx.Description, tx.IsReconciled);
    }
}
