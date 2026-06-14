using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace FinAdvisor.Infrastructure.Persistence.Configurations;

public class AccountConfiguration : IEntityTypeConfiguration<Account>
{
    public void Configure(EntityTypeBuilder<Account> builder)
    {
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Name).IsRequired().HasMaxLength(200);
        builder.Property(a => a.InstitutionName).IsRequired().HasMaxLength(200);
        builder.Property(a => a.AccountNumber).HasMaxLength(50);
        builder.Property(a => a.AccountType).HasConversion<string>();

        builder.HasMany<Holding>()
            .WithOne(h => h.Account)
            .HasForeignKey(h => h.AccountId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany<Transaction>()
            .WithOne(t => t.Account)
            .HasForeignKey(t => t.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
