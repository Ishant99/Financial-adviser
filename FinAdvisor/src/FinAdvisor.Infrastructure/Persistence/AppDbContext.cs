using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<UserProfile> UserProfiles => Set<UserProfile>();
    public DbSet<Account> Accounts => Set<Account>();
    public DbSet<Holding> Holdings => Set<Holding>();
    public DbSet<Transaction> Transactions => Set<Transaction>();
    public DbSet<Goal> Goals => Set<Goal>();
    public DbSet<SipPlan> SipPlans => Set<SipPlan>();
    public DbSet<RecommendationLog> RecommendationLogs => Set<RecommendationLog>();
    public DbSet<CasUploadLog> CasUploadLogs => Set<CasUploadLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
