using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public class EfAccountRepository(AppDbContext db)
    : EfRepository<Account>(db), IAccountRepository
{
    public async Task<IReadOnlyList<Account>> GetActiveAsync(CancellationToken ct = default) =>
        await Db.Accounts.Where(a => a.IsActive).ToListAsync(ct);

    public async Task<IReadOnlyList<Account>> GetByTypeAsync(AccountType type, CancellationToken ct = default) =>
        await Db.Accounts.Where(a => a.AccountType == type).ToListAsync(ct);
}
