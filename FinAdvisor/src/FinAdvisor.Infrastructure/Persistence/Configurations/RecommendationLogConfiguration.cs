using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class RecommendationLogConfiguration : IEntityTypeConfiguration<RecommendationLog>
{
    public void Configure(EntityTypeBuilder<RecommendationLog> builder)
    {
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Category).IsRequired().HasMaxLength(100);
        builder.Property(r => r.Title).IsRequired().HasMaxLength(80);
        builder.Property(r => r.Body).IsRequired().HasMaxLength(300);
        builder.Property(r => r.SupportingDataJson).HasColumnType("jsonb");
        builder.Property(r => r.Type).HasConversion<string>();
        builder.Property(r => r.Severity).HasConversion<string>();

        builder.HasIndex(r => r.GeneratedAt);
    }
}
