using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Domain.Entities;

public class Account
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public AccountType AccountType { get; private set; }
    public string InstitutionName { get; private set; } = string.Empty;
    public string? AccountNumber { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private Account() { }

    public static Account Create(
        string name,
        AccountType accountType,
        string institutionName,
        string? accountNumber = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        ArgumentException.ThrowIfNullOrWhiteSpace(institutionName);

        return new Account
        {
            Id = Guid.NewGuid(),
            Name = name,
            AccountType = accountType,
            InstitutionName = institutionName,
            AccountNumber = accountNumber,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow
        };
    }

    public void Deactivate() => IsActive = false;
    public void Reactivate() => IsActive = true;
}
