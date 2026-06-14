namespace FinAdvisor.Application.DTOs;

public record HoldingDto(
    Guid Id,
    Guid AccountId,
    string HoldingType,
    string Name,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    decimal CurrentValue,
    decimal GainLossPercent,
    DateTimeOffset AsOf,
    DateOnly? PurchaseDate,
    string? Sector,
    string? MarketCapCategory);

public record AddHoldingRequest(
    Guid AccountId,
    string HoldingType,
    string Name,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    DateTimeOffset AsOf,
    DateOnly? PurchaseDate,
    string? Sector = null,
    string? MarketCapCategory = null);

public record UpdateHoldingRequest(
    string Name,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    DateTimeOffset AsOf,
    DateOnly? PurchaseDate,
    string? Sector = null,
    string? MarketCapCategory = null);
