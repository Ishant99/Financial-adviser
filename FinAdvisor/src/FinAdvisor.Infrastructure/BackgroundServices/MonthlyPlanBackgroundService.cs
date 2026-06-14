using FinAdvisor.Application.Commands.Plan;
using FinAdvisor.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.BackgroundServices;

/// <summary>
/// Runs on the 1st of each month (UTC) to auto-generate the monthly financial plan.
/// Checks every hour; only fires when the day is 1 and a plan has not yet been
/// generated this calendar month (idempotent — uses recommendation dedup logic
/// inside GenerateMonthlyPlanCommandHandler).
/// </summary>
public class MonthlyPlanBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<MonthlyPlanBackgroundService> logger) : BackgroundService
{
    private int _lastRunMonth = -1;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            var now = DateTime.UtcNow;
            if (now.Day != 1) continue;
            if (now.Month == _lastRunMonth) continue;

            logger.LogInformation("Monthly plan auto-generation starting for {Month}/{Year}", now.Month, now.Year);
            try
            {
                using var scope = scopeFactory.CreateScope();
                var handler = scope.ServiceProvider
                    .GetRequiredService<GenerateMonthlyPlanCommandHandler>();
                await handler.HandleAsync(stoppingToken);
                _lastRunMonth = now.Month;
                logger.LogInformation("Monthly plan auto-generated successfully");

                var notifications = scope.ServiceProvider
                    .GetRequiredService<INotificationService>();
                await notifications.SendAsync(
                    $"FinAdvisor: Monthly plan for {now:MMMM yyyy} is ready",
                    "Your monthly financial plan has been generated. Open FinAdvisor to view your recommendations.",
                    stoppingToken);
            }
            catch (Exception ex) when (!stoppingToken.IsCancellationRequested)
            {
                logger.LogError(ex, "Auto-generation of monthly plan failed");
            }
        }
    }
}
