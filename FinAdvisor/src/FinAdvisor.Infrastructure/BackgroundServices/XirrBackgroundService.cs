using FinAdvisor.Application.Commands.SipPlans;
using FinAdvisor.Application.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.BackgroundServices;

public class XirrBackgroundService(
    IServiceScopeFactory scopeFactory,
    ILogger<XirrBackgroundService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await RunAsync(stoppingToken);

        using var timer = new PeriodicTimer(TimeSpan.FromHours(24));
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunAsync(stoppingToken);
        }
    }

    private async Task RunAsync(CancellationToken ct)
    {
        logger.LogInformation("XIRR background computation starting");
        try
        {
            using var scope = scopeFactory.CreateScope();
            var sipRepo = scope.ServiceProvider.GetRequiredService<ISipPlanRepository>();
            var handler = scope.ServiceProvider.GetRequiredService<ComputeSipXirrCommandHandler>();

            var activeSips = await sipRepo.GetActiveAsync(ct);
            foreach (var sip in activeSips)
            {
                try { await handler.HandleAsync(sip.Id, ct); }
                catch (Exception ex) { logger.LogWarning(ex, "XIRR failed for SIP {SipId}", sip.Id); }
            }

            logger.LogInformation("XIRR computation complete ({Count} SIPs)", activeSips.Count);
        }
        catch (Exception ex) when (!ct.IsCancellationRequested)
        {
            logger.LogError(ex, "XIRR background job failed");
        }
    }
}
