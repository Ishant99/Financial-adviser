namespace FinAdvisor.Application.DTOs;

public record XirrCashFlow(DateOnly Date, decimal Amount);

public record XirrRequest(IReadOnlyList<XirrCashFlow> CashFlows);

public record XirrResponse(decimal Xirr);
