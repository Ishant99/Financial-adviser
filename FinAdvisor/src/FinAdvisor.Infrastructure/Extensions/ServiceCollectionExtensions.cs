using FinAdvisor.Application.Commands.Goals;
using FinAdvisor.Application.Commands.Plan;
using FinAdvisor.Application.Commands.SipPlans;
using FinAdvisor.Application.Interfaces;
using FinAdvisor.Domain.Entities;
using FinAdvisor.Infrastructure.BackgroundServices;
using FinAdvisor.Infrastructure.Persistence;
using FinAdvisor.Infrastructure.Repositories;
using FinAdvisor.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Polly;

namespace FinAdvisor.Infrastructure.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("Default"),
                npgsql => npgsql.EnableRetryOnFailure(3)));

        services.AddScoped<IAccountRepository, EfAccountRepository>();
        services.AddScoped<IHoldingRepository, EfHoldingRepository>();
        services.AddScoped<ITransactionRepository, EfTransactionRepository>();
        services.AddScoped<IGoalRepository, EfGoalRepository>();
        services.AddScoped<ISipPlanRepository, EfSipPlanRepository>();
        services.AddScoped<IRecommendationRepository, EfRecommendationRepository>();
        services.AddScoped<IRepository<CasUploadLog>, EfCasUploadLogRepository>();
        services.AddScoped<RecalculateGoalProbabilityCommandHandler>();
        services.AddHostedService<GoalProbabilityBackgroundService>();
        services.AddScoped<ComputeSipXirrCommandHandler>();
        services.AddHostedService<XirrBackgroundService>();
        services.AddScoped<GenerateMonthlyPlanCommandHandler>();
        services.AddHostedService<MonthlyPlanBackgroundService>();
        services.AddScoped<INotificationService, NoOpNotificationService>();

        var analyticsBase = configuration["AnalyticsService:BaseUrl"]
            ?? "http://localhost:8000";

        services.AddHttpClient<IAnalyticsService, AnalyticsServiceClient>(client =>
        {
            client.BaseAddress = new Uri(analyticsBase.TrimEnd('/') + "/");
            client.Timeout = TimeSpan.FromSeconds(35);
        })
        .AddResilienceHandler("analytics", static builder =>
        {
            // Order: Retry → CircuitBreaker → Timeout (timeout is innermost)
            builder.AddRetry(new HttpRetryStrategyOptions
            {
                MaxRetryAttempts = 3,
                Delay = TimeSpan.FromSeconds(1),
                BackoffType = DelayBackoffType.Exponential,
                UseJitter = true,
            });
            builder.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
            {
                MinimumThroughput = 5,
                SamplingDuration = TimeSpan.FromSeconds(30),
                BreakDuration = TimeSpan.FromSeconds(30),
                FailureRatio = 0.5,
            });
            builder.AddTimeout(TimeSpan.FromSeconds(30));
        });

        return services;
    }
}
