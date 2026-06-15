using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Commands.Accounts;

public class CreateAccountCommandHandler(IAccountRepository accountRepo)
{
    public async Task<AccountDto> HandleAsync(AddAccountRequest req, CancellationToken ct = default)
    {
        if (!Enum.TryParse<AccountType>(req.AccountType, ignoreCase: true, out var accountType))
            throw new ArgumentException($"Unknown account type: {req.AccountType}");

        var account = Account.Create(req.Name, accountType, req.InstitutionName, req.AccountNumber);
        await accountRepo.AddAsync(account, ct);

        return new AccountDto(
            account.Id, account.Name, account.AccountType.ToString(),
            account.InstitutionName, account.AccountNumber, account.IsActive);
    }
}
