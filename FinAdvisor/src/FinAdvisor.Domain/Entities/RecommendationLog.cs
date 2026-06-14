using FinAdvisor.Domain.Enums;

namespace FinAdvisor.Domain.Entities;

public class RecommendationLog
{
    public Guid Id { get; private set; }
    public DateTimeOffset GeneratedAt { get; private set; }
    public RecommendationType Type { get; private set; }
    public string Category { get; private set; } = string.Empty;
    public RecommendationSeverity Severity { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Body { get; private set; } = string.Empty;
    public string SupportingDataJson { get; private set; } = "{}";
    public bool IsRead { get; private set; }
    public bool IsActioned { get; private set; }

    private RecommendationLog() { }

    public static RecommendationLog Create(
        RecommendationType type,
        string category,
        RecommendationSeverity severity,
        string title,
        string body,
        string supportingDataJson = "{}")
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(category);
        ArgumentException.ThrowIfNullOrWhiteSpace(title);
        ArgumentException.ThrowIfNullOrWhiteSpace(body);

        return new RecommendationLog
        {
            Id = Guid.NewGuid(),
            GeneratedAt = DateTimeOffset.UtcNow,
            Type = type,
            Category = category,
            Severity = severity,
            Title = title,
            Body = body,
            SupportingDataJson = supportingDataJson,
            IsRead = false,
            IsActioned = false
        };
    }

    public void MarkRead() => IsRead = true;
    public void MarkActioned()
    {
        IsRead = true;
        IsActioned = true;
    }
}
