using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.Persistence;

public static class DevSeedData
{
    public static async Task SeedAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

        await db.Database.MigrateAsync();

        if (await db.UserProfiles.AnyAsync()) return;

        await SeedCoreDataAsync(db, logger);
    }

    // Called both by SeedAsync (first run) and ResetDataService (reset)
    internal static async Task SeedCoreDataAsync(AppDbContext db, ILogger logger)
    {
        logger.LogInformation("Seeding development data...");

        // User
        var profile = UserProfile.Create("Ishant Goyal", "ishant@example.com");
        db.UserProfiles.Add(profile);

        // Accounts
        var hdfc = Account.Create("HDFC Savings", AccountType.SavingsBank, "HDFC Bank", "XXXX1234");
        var icici = Account.Create("ICICI Salary", AccountType.SavingsBank, "ICICI Bank", "XXXX5678");
        db.Accounts.AddRange(hdfc, icici);

        await db.SaveChangesAsync();

        // Goals
        var emergencyFund = Goal.Create(
            "Emergency Fund",
            targetAmount: 500_000m,   // ₹5L = 6 months of ₹83k expenses
            targetDate: DateOnly.FromDateTime(DateTime.Today.AddMonths(6)),
            priority: 1,
            targetAssetAllocation: new AssetAllocation(0, 80, 0, 20));

        var retirement = Goal.Create(
            "Retirement",
            targetAmount: 50_000_000m,  // ₹5 Crore
            targetDate: DateOnly.FromDateTime(DateTime.Today.AddYears(30)),
            priority: 2,
            targetAssetAllocation: new AssetAllocation(80, 15, 5, 0));

        var houseDownPayment = Goal.Create(
            "House Down Payment",
            targetAmount: 3_000_000m,   // ₹30L
            targetDate: DateOnly.FromDateTime(DateTime.Today.AddYears(5)),
            priority: 3,
            targetAssetAllocation: new AssetAllocation(40, 50, 10, 0));

        db.Goals.AddRange(emergencyFund, retirement, houseDownPayment);
        await db.SaveChangesAsync();

        // Holdings
        var holdings = new[]
        {
            Holding.Create(
                hdfc.Id,
                HoldingType.MutualFund,
                "Mirae Asset Large Cap Fund - Direct Growth",
                units: 1234.567m,
                purchaseNav: 72.45m,
                currentNav: 98.32m,
                asOf: DateTimeOffset.UtcNow),

            Holding.Create(
                hdfc.Id,
                HoldingType.MutualFund,
                "Parag Parikh Flexi Cap Fund - Direct Growth",
                units: 456.789m,
                purchaseNav: 42.10m,
                currentNav: 67.85m,
                asOf: DateTimeOffset.UtcNow),

            Holding.Create(
                hdfc.Id,
                HoldingType.MutualFund,
                "HDFC Short Term Debt Fund - Direct Growth",
                units: 2100.000m,
                purchaseNav: 20.50m,
                currentNav: 24.30m,
                asOf: DateTimeOffset.UtcNow),

            Holding.Create(
                hdfc.Id,
                HoldingType.FD,
                "HDFC Bank FD - 24 months",
                units: 1m,
                purchaseNav: 200_000m,
                currentNav: 200_000m,
                asOf: DateTimeOffset.UtcNow),

            Holding.Create(
                icici.Id,
                HoldingType.Cash,
                "ICICI Bank Balance",
                units: 1m,
                purchaseNav: 85_000m,
                currentNav: 85_000m,
                asOf: DateTimeOffset.UtcNow),
        };
        db.Holdings.AddRange(holdings);

        // SIP Plans
        var sipPlans = new[]
        {
            SipPlan.Create(
                "Mirae Asset Large Cap Fund - Direct Growth",
                fundCode: "119551",
                monthlyAmount: 10_000m,
                sipDate: 5,
                startDate: DateOnly.FromDateTime(DateTime.Today.AddYears(-2)),
                benchmarkIndex: "NIFTY100TRI",
                linkedGoalId: retirement.Id),

            SipPlan.Create(
                "Parag Parikh Flexi Cap Fund - Direct Growth",
                fundCode: "122639",
                monthlyAmount: 8_000m,
                sipDate: 10,
                startDate: DateOnly.FromDateTime(DateTime.Today.AddYears(-1)),
                benchmarkIndex: "NIFTY500TRI",
                linkedGoalId: retirement.Id),

            SipPlan.Create(
                "HDFC Short Term Debt Fund - Direct Growth",
                fundCode: "119026",
                monthlyAmount: 5_000m,
                sipDate: 15,
                startDate: DateOnly.FromDateTime(DateTime.Today.AddMonths(-8)),
                benchmarkIndex: "CRISIL Short Term Bond Index",
                linkedGoalId: houseDownPayment.Id),
        };
        db.SipPlans.AddRange(sipPlans);

        await db.SaveChangesAsync();
        logger.LogInformation(
            "Seeded: 1 user, 2 accounts, 5 holdings, 3 goals, 3 SIP plans");
    }
}
