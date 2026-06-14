using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Domain.Entities;

public class Transaction
{
    public Guid Id { get; private set; }
    public Guid AccountId { get; private set; }
    public DateOnly Date { get; private set; }
    public decimal Amount { get; private set; }
    public TransactionType TransactionType { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public string Description { get; private set; } = string.Empty;
    public bool IsReconciled { get; private set; }

    public Account Account { get; private set; } = null!;

    private Transaction() { }

    public static Transaction Create(
        Guid accountId,
        DateOnly date,
        decimal amount,
        TransactionType transactionType,
        string category,
        string description)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive.", nameof(amount));
        ArgumentException.ThrowIfNullOrWhiteSpace(category);

        return new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = accountId,
            Date = date,
            Amount = amount,
            TransactionType = transactionType,
            Category = category,
            Description = description ?? string.Empty,
            IsReconciled = false
        };
    }

    public void Update(
        DateOnly date,
        decimal amount,
        TransactionType transactionType,
        string category,
        string description)
    {
        if (amount <= 0) throw new ArgumentException("Amount must be positive.", nameof(amount));
        ArgumentException.ThrowIfNullOrWhiteSpace(category);
        Date = date;
        Amount = amount;
        TransactionType = transactionType;
        Category = category;
        Description = description ?? string.Empty;
    }

    public void Reconcile() => IsReconciled = true;
    public void Recategorise(string newCategory)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(newCategory);
        Category = newCategory;
    }
}
