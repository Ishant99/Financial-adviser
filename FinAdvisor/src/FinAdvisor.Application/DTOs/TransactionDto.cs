namespace FinAdvisor.Application.DTOs;

public record TransactionDto(
    Guid Id,
    Guid AccountId,
    DateOnly Date,
    decimal Amount,
    string TransactionType,
    string Category,
    string Description,
    bool IsReconciled);

public record AddTransactionRequest(
    Guid AccountId,
    DateOnly Date,
    decimal Amount,
    string TransactionType,
    string Category,
    string Description);
