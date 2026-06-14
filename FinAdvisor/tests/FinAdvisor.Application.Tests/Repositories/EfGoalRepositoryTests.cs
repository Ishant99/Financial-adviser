using FinAdvisor.Domain.Entities;
using FinAdvisor.Domain.Enums;
using FinAdvisor.Domain.ValueObjects;
using FinAdvisor.Infrastructure.Persistence;
using FinAdvisor.Infrastructure.Repositories;
using FluentAssertions;
using Microsoft.EntityFrameworkCore;

namespace FinAdvisor.Application.Tests.Repositories;

public class EfGoalRepositoryTests : IDisposable
{
    private readonly AppDbContext _db;
    private readonly EfGoalRepository _repo;

    public EfGoalRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase("GoalRepoTests_" + Guid.NewGuid())
            .Options;
        _db = new AppDbContext(options);
        _repo = new EfGoalRepository(_db);
    }

    private static Goal MakeGoal(string name = "Test Goal", GoalStatus? status = null)
    {
        var g = Goal.Create(
            name,
            targetAmount: 1_000_000m,
            targetDate: DateOnly.FromDateTime(DateTime.Today.AddYears(5)),
            priority: 2,
            targetAssetAllocation: AssetAllocation.Balanced());
        if (status == GoalStatus.Paused) g.Pause();
        if (status == GoalStatus.Completed) g.Complete();
        return g;
    }

    [Fact]
    public async Task AddAsync_ThenGetById_ReturnsGoal()
    {
        var goal = MakeGoal("Retirement");
        await _repo.AddAsync(goal);

        var result = await _repo.GetByIdAsync(goal.Id);

        result.Should().NotBeNull();
        result!.Name.Should().Be("Retirement");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsAllGoals()
    {
        await _repo.AddAsync(MakeGoal("G1"));
        await _repo.AddAsync(MakeGoal("G2"));

        var all = await _repo.GetAllAsync();

        all.Should().HaveCount(2);
    }

    [Fact]
    public async Task UpdateAsync_ChangesArePersisted()
    {
        var goal = MakeGoal("Before");
        await _repo.AddAsync(goal);

        goal.Pause();
        await _repo.UpdateAsync(goal);

        var updated = await _repo.GetByIdAsync(goal.Id);
        updated!.Status.Should().Be(GoalStatus.Paused);
    }

    [Fact]
    public async Task DeleteAsync_RemovesGoal()
    {
        var goal = MakeGoal("ToDelete");
        await _repo.AddAsync(goal);

        await _repo.DeleteAsync(goal);

        var result = await _repo.GetByIdAsync(goal.Id);
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetActiveAsync_ReturnsOnlyActiveGoals()
    {
        await _repo.AddAsync(MakeGoal("Active1"));
        await _repo.AddAsync(MakeGoal("Active2"));
        await _repo.AddAsync(MakeGoal("Paused", GoalStatus.Paused));

        var active = await _repo.GetActiveAsync();

        active.Should().HaveCount(2);
        active.Should().AllSatisfy(g => g.Status.Should().Be(GoalStatus.Active));
    }

    [Fact]
    public async Task GetByStatusAsync_ReturnsMatchingGoals()
    {
        await _repo.AddAsync(MakeGoal("A1"));
        await _repo.AddAsync(MakeGoal("P1", GoalStatus.Paused));
        await _repo.AddAsync(MakeGoal("P2", GoalStatus.Paused));

        var paused = await _repo.GetByStatusAsync(GoalStatus.Paused);

        paused.Should().HaveCount(2);
    }

    public void Dispose() => _db.Dispose();
}
