using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Application.Interfaces;

public interface IAccountRepository : IRepository<Account>
{
    Task<IReadOnlyList<Account>> GetActiveAsync(CancellationToken ct = default);
    Task<IReadOnlyList<Account>> GetByTypeAsync(AccountType type, CancellationToken ct = default);
}
