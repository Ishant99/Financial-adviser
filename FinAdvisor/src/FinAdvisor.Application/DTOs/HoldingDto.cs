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
    DateTimeOffset AsOf);

public record AddHoldingRequest(
    Guid AccountId,
    string HoldingType,
    string Name,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    DateTimeOffset AsOf);

public record UpdateHoldingRequest(
    string Name,
    decimal Units,
    decimal PurchaseNav,
    decimal CurrentNav,
    DateTimeOffset AsOf);
