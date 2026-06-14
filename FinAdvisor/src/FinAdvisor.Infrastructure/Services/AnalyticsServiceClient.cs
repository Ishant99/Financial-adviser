using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using FinAdvisor.Application.DTOs;
using FinAdvisor.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace FinAdvisor.Infrastructure.Services;

public class AnalyticsServiceClient(HttpClient http, ILogger<AnalyticsServiceClient> logger)
    : IAnalyticsService
{
    private static readonly JsonSerializerOptions _snakeCaseOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
    };
    public async Task<CasParseResult> ParseCasAsync(
        Stream pdfStream,
        string? password,
        CancellationToken ct = default)
    {
        using var content = new MultipartFormDataContent();
        content.Add(new StreamContent(pdfStream), "file", "cas.pdf");
        if (!string.IsNullOrEmpty(password))
            content.Add(new StringContent(password), "password");

        using var request = new HttpRequestMessage(HttpMethod.Post, "parse-cas") { Content = content };
        request.Headers.Add("X-Correlation-ID",
            Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"));

        logger.LogInformation("Calling analytics service /parse-cas");
        var response = await http.SendAsync(request, ct);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Analytics service /parse-cas returned {Status}: {Detail}",
                (int)response.StatusCode, detail);
            throw new AnalyticsServiceException(
                $"CAS parse failed ({(int)response.StatusCode}): {detail}");
        }

        var result = await response.Content.ReadFromJsonAsync<PythonCasResponse>(ct)
            ?? throw new AnalyticsServiceException("Empty response from analytics service");

        return new CasParseResult(
            result.InvestorName,
            result.StatementDate,
            result.TotalValue,
            result.Holdings.Select(h => new CasHoldingResult(
                h.FundName, h.FundCode, h.Units, h.Nav, h.Value, h.Folio, h.Isin)).ToList());
    }

    public async Task<MonthlyPlanResponse> GenerateMonthlyPlanAsync(
        MonthlyPlanContext context, CancellationToken ct = default)
    {
        using var reqMsg = new HttpRequestMessage(HttpMethod.Post, "plan/generate");
        reqMsg.Headers.Add("X-Correlation-ID",
            Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"));
        reqMsg.Content = JsonContent.Create(context, options: _snakeCaseOptions);

        logger.LogInformation("Calling analytics service /plan/generate");
        var response = await http.SendAsync(reqMsg, ct);
        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(ct);
            throw new AnalyticsServiceException($"Plan generation failed ({(int)response.StatusCode}): {detail}");
        }

        var result = await response.Content.ReadFromJsonAsync<PythonPlanResponse>(ct)
            ?? throw new AnalyticsServiceException("Empty plan response");

        return new MonthlyPlanResponse(
            result.surplus,
            result.sections.Select(s => new MonthlyPlanSection(s.title, s.amount, s.narrative)).ToList(),
            result.overall_narrative);
    }

    public async Task<XirrResponse> ComputeXirrAsync(XirrRequest request, CancellationToken ct = default)
    {
        using var reqMsg = new HttpRequestMessage(HttpMethod.Post, "xirr/compute");
        reqMsg.Headers.Add("X-Correlation-ID",
            Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"));
        reqMsg.Content = JsonContent.Create(request, options: _snakeCaseOptions);

        var response = await http.SendAsync(reqMsg, ct);
        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(ct);
            throw new AnalyticsServiceException($"XIRR compute failed ({(int)response.StatusCode}): {detail}");
        }

        var result = await response.Content.ReadFromJsonAsync<PythonXirrResponse>(ct)
            ?? throw new AnalyticsServiceException("Empty XIRR response");
        return new XirrResponse(result.xirr);
    }

    public async Task<GoalSimulationResponse> SimulateGoalAsync(
        GoalSimulationRequest request,
        CancellationToken ct = default)
    {
        using var reqMsg = new HttpRequestMessage(HttpMethod.Post, "simulation/simulate-goal");
        reqMsg.Headers.Add("X-Correlation-ID",
            Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"));
        reqMsg.Content = JsonContent.Create(request, options: _snakeCaseOptions);

        logger.LogInformation("Calling analytics service /simulation/simulate-goal");
        var response = await http.SendAsync(reqMsg, ct);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Analytics service /simulation/simulate-goal returned {Status}: {Detail}",
                (int)response.StatusCode, detail);
            throw new AnalyticsServiceException(
                $"Goal simulation failed ({(int)response.StatusCode}): {detail}");
        }

        var result = await response.Content.ReadFromJsonAsync<PythonSimulationResponse>(ct)
            ?? throw new AnalyticsServiceException("Empty response from analytics service");

        return new GoalSimulationResponse(
            result.probability_of_success,
            result.p10_corpus,
            result.p50_corpus,
            result.p90_corpus);
    }

    public async Task<IReadOnlyList<GeneratedRecommendationResult>> GenerateRecommendationsAsync(
        GenerateRecommendationsRequest request,
        CancellationToken ct = default)
    {
        using var reqMsg = new HttpRequestMessage(HttpMethod.Post, "recommendations/generate");
        reqMsg.Headers.Add("X-Correlation-ID",
            Activity.Current?.TraceId.ToString() ?? Guid.NewGuid().ToString("N"));
        reqMsg.Content = JsonContent.Create(request, options: _snakeCaseOptions);

        logger.LogInformation("Calling analytics service /recommendations/generate");
        var response = await http.SendAsync(reqMsg, ct);

        if (!response.IsSuccessStatusCode)
        {
            var detail = await response.Content.ReadAsStringAsync(ct);
            logger.LogWarning("Analytics service /recommendations/generate returned {Status}: {Detail}",
                (int)response.StatusCode, detail);
            throw new AnalyticsServiceException(
                $"Recommendation generation failed ({(int)response.StatusCode}): {detail}");
        }

        var result = await response.Content.ReadFromJsonAsync<PythonGenerateResponse>(ct)
            ?? throw new AnalyticsServiceException("Empty response from analytics service");

        return result.Recommendations
            .Select(r => new GeneratedRecommendationResult(r.Type, r.Severity, r.Category, r.Title, r.Body))
            .ToList();
    }

    // Python snake_case response shape
    private sealed record PythonCasResponse(
        string investor_name,
        string statement_date,
        decimal total_value,
        List<PythonCasHolding> holdings)
    {
        public string InvestorName => investor_name;
        public string StatementDate => statement_date;
        public decimal TotalValue => total_value;
        public List<PythonCasHolding> Holdings => holdings;
    }

    private sealed record PythonCasHolding(
        string fund_name,
        string fund_code,
        decimal units,
        decimal nav,
        decimal value,
        string folio,
        string? isin)
    {
        public string FundName => fund_name;
        public string FundCode => fund_code;
        public decimal Units => units;
        public decimal Nav => nav;
        public decimal Value => value;
        public string Folio => folio;
        public string? Isin => isin;
    }

    private sealed record PythonPlanSection(string title, decimal? amount, string narrative);
    private sealed record PythonPlanResponse(decimal surplus, List<PythonPlanSection> sections, string overall_narrative);
    private sealed record PythonXirrResponse(decimal xirr);

    private sealed record PythonSimulationResponse(
        decimal probability_of_success,
        decimal p10_corpus,
        decimal p50_corpus,
        decimal p90_corpus);

    private sealed record PythonGenerateResponse(List<PythonRecommendation> recommendations)
    {
        public List<PythonRecommendation> Recommendations => recommendations;
    }

    private sealed record PythonRecommendation(
        string type,
        string severity,
        string category,
        string title,
        string body)
    {
        public string Type => type;
        public string Severity => severity;
        public string Category => category;
        public string Title => title;
        public string Body => body;
    }
}

public sealed class AnalyticsServiceException(string message) : Exception(message);
