using FinAdvisor.Application.Interfaces;
using FinAdvisor.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Repositories;

public abstract class EfRepository<T>(AppDbContext db) : IRepository<T> where T : class
{
    protected readonly AppDbContext Db = db;

    public virtual async Task<T?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await Db.Set<T>().FindAsync([id], ct);

    public virtual async Task<IReadOnlyList<T>> GetAllAsync(CancellationToken ct = default) =>
        await Db.Set<T>().ToListAsync(ct);

    public virtual async Task AddAsync(T entity, CancellationToken ct = default)
    {
        await Db.Set<T>().AddAsync(entity, ct);
        await Db.SaveChangesAsync(ct);
    }

    public virtual async Task UpdateAsync(T entity, CancellationToken ct = default)
    {
        Db.Set<T>().Update(entity);
        await Db.SaveChangesAsync(ct);
    }

    public virtual async Task DeleteAsync(T entity, CancellationToken ct = default)
    {
        Db.Set<T>().Remove(entity);
        await Db.SaveChangesAsync(ct);
    }
}
