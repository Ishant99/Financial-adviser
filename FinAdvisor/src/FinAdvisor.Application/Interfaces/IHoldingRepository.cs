using FinAdvisor.Domain.Entities;

namespace FinAdvisor.Application.Interfaces;

public interface IHoldingRepository : IRepository<Holding>
{
    Task<IReadOnlyList<Holding>> GetByAccountAsync(Guid accountId, CancellationToken ct = default);
}
