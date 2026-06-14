namespace FinAdvisor.Application.DTOs;

public record UpdateTransactionRequest(
    DateOnly Date,
    decimal Amount,
    string TransactionType,
    string Category,
    string Description);
