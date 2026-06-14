using FinAdvisor.Application.Commands.Goals;
using FinAdvisor.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.BackgroundServices;

public class GoalProbabilityBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<GoalProbabilityBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        // Run once at startup to populate any null probabilities
        await RunAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunAsync(stoppingToken);
        }
    }

    private async Task RunAsync(CancellationToken ct)
    {
        logger.LogInformation("Goal probability recalculation starting");

        try
        {
            using var scope = scopeFactory.CreateScope();
            var goalRepo = scope.ServiceProvider.GetRequiredService<IGoalRepository>();
            var handler = scope.ServiceProvider.GetRequiredService<RecalculateGoalProbabilityCommandHandler>();

            var activeGoals = await goalRepo.GetActiveAsync(ct);

            foreach (var goal in activeGoals)
            {
                try
                {
                    await handler.HandleAsync(goal.Id, ct);
                    logger.LogDebug("Simulated goal {GoalId} ({GoalName})", goal.Id, goal.Name);
                }
                catch (Exception ex)
                {
                    // Swallow per-goal errors so one failure doesn't abort all others
                    logger.LogWarning(ex, "Failed to simulate goal {GoalId}", goal.Id);
                }
            }

            logger.LogInformation("Goal probability recalculation complete ({Count} goals)", activeGoals.Count);
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            logger.LogError(ex, "Goal probability background job failed");
        }
    }
}
