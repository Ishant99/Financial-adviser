using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class CasUploadLogConfiguration : IEntityTypeConfiguration<CasUploadLog>
{
    public void Configure(EntityTypeBuilder<CasUploadLog> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.FileName).HasMaxLength(255).IsRequired();
        builder.Property(x => x.Status).HasMaxLength(20).IsRequired();
        builder.Property(x => x.InvestorName).HasMaxLength(200);
        builder.Property(x => x.ErrorMessage).HasMaxLength(1000);
        builder.HasIndex(x => x.UploadedAt);
    }
}
