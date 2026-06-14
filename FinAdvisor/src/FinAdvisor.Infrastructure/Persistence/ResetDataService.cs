using FinAdvisor.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.Persistence;

/// <summary>
/// Development-only service that wipes all data and leaves the app in a clean empty state.
/// A sentinel UserProfile is inserted so the auto-seed guard on API restart is satisfied
/// (preventing DevSeedData from re-populating everything on the next startup).
/// </summary>
public class ResetDataService(AppDbContext db, ILogger<ResetDataService> logger)
{
    public async Task ResetAsync(CancellationToken ct = default)
    {
        logger.LogWarning("DEV RESET: clearing all data…");

        // Delete in FK-safe order (children before parents)
        await db.CasUploadLogs.ExecuteDeleteAsync(ct);
        await db.RecommendationLogs.ExecuteDeleteAsync(ct);
        await db.SipPlans.ExecuteDeleteAsync(ct);
        await db.Holdings.ExecuteDeleteAsync(ct);
        await db.Transactions.ExecuteDeleteAsync(ct);
        await db.Goals.ExecuteDeleteAsync(ct);
        await db.Accounts.ExecuteDeleteAsync(ct);
        await db.UserProfiles.ExecuteDeleteAsync(ct);

        // Insert a sentinel UserProfile so DevSeedData.SeedAsync won't auto-reseed
        // on the next API restart (it guards on UserProfiles.Any()).
        db.UserProfiles.Add(UserProfile.Create("User", "user@finadvisor.local"));
        await db.SaveChangesAsync(ct);

        logger.LogWarning("DEV RESET: complete — app is in empty state");
    }
}
