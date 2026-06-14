using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;

namespace FinAdvisor.Application.Queries;

public class GetAccountsQueryHandler(IAccountRepository accountRepo)
{
    public async Task<IReadOnlyList<AccountDto>> HandleAsync(CancellationToken ct = default)
    {
        var accounts = await accountRepo.GetAllAsync(ct);
        return accounts.Select(a => new AccountDto(
            a.Id, a.Name, a.AccountType.ToString(),
            a.InstitutionName, a.AccountNumber, a.IsActive)).ToList();
    }
}
