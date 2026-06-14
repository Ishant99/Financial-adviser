using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class HoldingConfiguration : IEntityTypeConfiguration<Holding>
{
    public void Configure(EntityTypeBuilder<Holding> builder)
    {
        builder.HasKey(h => h.Id);
        builder.Property(h => h.Name).IsRequired().HasMaxLength(300);
        builder.Property(h => h.HoldingType).HasConversion<string>();
        builder.Property(h => h.Units).HasPrecision(18, 6);
        builder.Property(h => h.PurchaseNav).HasPrecision(18, 4);
        builder.Property(h => h.CurrentNav).HasPrecision(18, 4);
        builder.Property(h => h.CurrentValue).HasPrecision(18, 2);
        builder.Property(h => h.PurchaseDate).IsRequired(false);
        builder.Property(h => h.Sector).HasMaxLength(100).IsRequired(false);
        builder.Property(h => h.MarketCapCategory).HasMaxLength(50).IsRequired(false);

        builder.HasIndex(h => h.AccountId);
    }
}
