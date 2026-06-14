using FinAdvisor.Api;
using FinAdvisor.Application.Commands.Goals;
using FinAdvisor.Application.Commands.Holdings;
using FinAdvisor.Application.Commands.Plan;
using FinAdvisor.Application.Commands.Recommendations;
using FinAdvisor.Application.Commands.SipPlans;
using FinAdvisor.Application.Commands.Transactions;
using FinAdvisor.Application.Commands.Upload;
using FinAdvisor.Application.Queries;
using FinAdvisor.Application.Validators;
using FinAdvisor.Infrastructure.Extensions;
using FinAdvisor.Infrastructure.Persistence;
using FluentValidation;
using Serilog;
using Serilog.Events;
using System.Reflection;
using System.Text.Json;
using System.Text.Json.Serialization;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate:
        "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting FinAdvisor API v{Version} [{Environment}]",
        Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "dev",
        Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production");

    var builder = WebApplication.CreateBuilder(args);

    builder.Host.UseSerilog((ctx, services, config) => config
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console(outputTemplate:
            "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}"));

    builder.Services.AddInfrastructure(builder.Configuration);

    builder.Services.AddControllers()
        .AddJsonOptions(opts =>
        {
            opts.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
            opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
            opts.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        });

    // Query handlers
    builder.Services.AddScoped<GetNetWorthQueryHandler>();
    builder.Services.AddScoped<GetNetWorthHistoryQueryHandler>();
    builder.Services.AddScoped<GetHoldingsQueryHandler>();
    builder.Services.AddScoped<GetGoalsQueryHandler>();
    builder.Services.AddScoped<GetTransactionsQueryHandler>();
    builder.Services.AddScoped<GetSipPlansQueryHandler>();
    builder.Services.AddScoped<GetAccountsQueryHandler>();

    // Command handlers
    builder.Services.AddScoped<AddHoldingCommandHandler>();
    builder.Services.AddScoped<UpdateHoldingCommandHandler>();
    builder.Services.AddScoped<DeleteHoldingCommandHandler>();
    builder.Services.AddScoped<AddGoalCommandHandler>();
    builder.Services.AddScoped<UpdateGoalCommandHandler>();
    builder.Services.AddScoped<PauseResumeGoalCommandHandler>();
    builder.Services.AddScoped<AddTransactionCommandHandler>();
    builder.Services.AddScoped<UpdateTransactionCommandHandler>();
    builder.Services.AddScoped<DeleteTransactionCommandHandler>();
    builder.Services.AddScoped<AddSipPlanCommandHandler>();
    builder.Services.AddScoped<PauseResumeSipPlanCommandHandler>();
    builder.Services.AddScoped<ImportCasHoldingsCommandHandler>();
    builder.Services.AddScoped<GenerateRecommendationsCommandHandler>();
    builder.Services.AddScoped<GenerateMonthlyPlanCommandHandler>();
    builder.Services.AddScoped<GetRecommendationsQueryHandler>();
    builder.Services.AddScoped<GetCashFlowQueryHandler>();
    builder.Services.AddScoped<GetTaxSummaryQueryHandler>();
    builder.Services.AddScoped<GetPortfolioAnalyticsQueryHandler>();

    // Dev-only services
    if (builder.Environment.IsDevelopment())
        builder.Services.AddScoped<ResetDataService>();

    // Validators
    builder.Services.AddValidatorsFromAssemblyContaining<AddHoldingRequestValidator>();

    builder.Services.AddCors(options =>
        options.AddPolicy("NextJs", policy =>
            policy.WithOrigins("http://localhost:3000")
                  .AllowAnyHeader()
                  .AllowAnyMethod()));

    builder.Services.AddHealthChecks()
        .AddNpgSql(
            builder.Configuration.GetConnectionString("Default")!,
            name: "postgres",
            tags: ["db", "ready"]);

    var app = builder.Build();

    app.UseSerilogRequestLogging();
    app.UseCors("NextJs");
    app.MapControllers();

    app.MapHealthChecks("/api/health", new Microsoft.AspNetCore.Diagnostics.HealthChecks.HealthCheckOptions
    {
        ResponseWriter = HealthCheckResponseWriter.WriteJsonAsync
    });

    if (app.Environment.IsDevelopment())
    {
        await DevSeedData.SeedAsync(app.Services);
    }

    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

public partial class Program { }
