using FinAdvisor.Domain.ValueObjects;

namespace FinAdvisor.Domain.Services;

public static class MonthlySurplusCalculator
{
    public static Money Calculate(Money income, Money fixedObligations, Money variableEstimate)
    {
        return income - fixedObligations - variableEstimate;
    }
}
