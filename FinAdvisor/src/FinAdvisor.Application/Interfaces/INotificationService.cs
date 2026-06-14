namespace FinAdvisor.Application.Interfaces;

public interface INotificationService
{
    Task SendAsync(string subject, string body, CancellationToken ct = default);
}
