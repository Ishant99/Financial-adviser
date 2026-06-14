using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class GoalConfiguration : IEntityTypeConfiguration<Goal>
{
    public void Configure(EntityTypeBuilder<Goal> builder)
    {
        builder.HasKey(g => g.Id);
        builder.Property(g => g.Name).IsRequired().HasMaxLength(200);
        builder.Property(g => g.TargetAmount).HasPrecision(18, 2);
        builder.Property(g => g.Status).HasConversion<string>();
        builder.Property(g => g.ProbabilityOfSuccess).HasPrecision(5, 2);
        builder.Property(g => g.P10Corpus).HasPrecision(18, 2);
        builder.Property(g => g.P50Corpus).HasPrecision(18, 2);
        builder.Property(g => g.P90Corpus).HasPrecision(18, 2);

        // AssetAllocation owned type — maps to same table
        builder.OwnsOne(g => g.TargetAssetAllocation, aa =>
        {
            aa.Property(a => a.EquityPercent).HasColumnName("AllocationEquityPct").HasPrecision(5, 2);
            aa.Property(a => a.DebtPercent).HasColumnName("AllocationDebtPct").HasPrecision(5, 2);
            aa.Property(a => a.GoldPercent).HasColumnName("AllocationGoldPct").HasPrecision(5, 2);
            aa.Property(a => a.CashPercent).HasColumnName("AllocationCashPct").HasPrecision(5, 2);
        });
    }
}
