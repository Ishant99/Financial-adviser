using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class SipPlanConfiguration : IEntityTypeConfiguration<SipPlan>
{
    public void Configure(EntityTypeBuilder<SipPlan> builder)
    {
        builder.HasKey(s => s.Id);
        builder.Property(s => s.FundName).IsRequired().HasMaxLength(300);
        builder.Property(s => s.FundCode).IsRequired().HasMaxLength(20);
        builder.Property(s => s.MonthlyAmount).HasPrecision(18, 2);
        builder.Property(s => s.BenchmarkIndex).IsRequired().HasMaxLength(100);
        builder.Property(s => s.Status).HasConversion<string>();
        builder.Property(s => s.LatestXirr).HasPrecision(8, 6);
        builder.Property(s => s.BenchmarkXirr).HasPrecision(8, 6).IsRequired(false);

        builder.HasIndex(s => s.FundCode);

        builder.HasOne(s => s.LinkedGoal)
            .WithMany()
            .HasForeignKey(s => s.LinkedGoalId)
            .OnDelete(DeleteBehavior.SetNull)
            .IsRequired(false);
    }
}
