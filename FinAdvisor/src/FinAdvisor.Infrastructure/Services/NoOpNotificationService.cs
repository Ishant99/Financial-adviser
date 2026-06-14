using FinAdvisor.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.Services;

// Replace with a real SMTP/Telegram implementation when notification credentials are available.
public class NoOpNotificationService(ILogger<NoOpNotificationService> logger) : INotificationService
{
    public Task SendAsync(string subject, string body, CancellationToken ct = default)
    {
        logger.LogInformation("Notification (no-op): {Subject}", subject);
        return Task.CompletedTask;
    }
}
