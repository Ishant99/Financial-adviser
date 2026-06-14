using FluentAssertions;
using System.Net;
using System.Text.Json;

namespace FinAdvisor.Api.Tests;

public class HealthCheckTests(TestWebApplicationFactory factory)
    : IClassFixture<TestWebApplicationFactory>
{
    [Fact]
    public async Task HealthEndpoint_Returns200_WhenCalled()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsJsonWithStatusAndTimestamp()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/health");
        var body = await response.Content.ReadAsStringAsync();

        using var doc = JsonDocument.Parse(body);
        doc.RootElement.TryGetProperty("status", out var statusProp).Should().BeTrue();
        statusProp.GetString().Should().Be("healthy");
        doc.RootElement.TryGetProperty("timestamp", out _).Should().BeTrue();
    }
}
