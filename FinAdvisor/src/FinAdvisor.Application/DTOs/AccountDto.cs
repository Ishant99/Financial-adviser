namespace FinAdvisor.Application.DTOs;

public record AccountDto(
    Guid Id,
    string Name,
    string AccountType,
    string InstitutionName,
    string? AccountNumber,
    bool IsActive);

public record AddAccountRequest(
    string Name,
    string AccountType,
    string InstitutionName,
    string? AccountNumber);
