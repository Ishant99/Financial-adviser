using FinAdvisor.Application.DTOs;
using FluentValidation;

namespace FinAdvisor.Application.Validators;

public class AddSipPlanRequestValidator : AbstractValidator<AddSipPlanRequest>
{
    public AddSipPlanRequestValidator()
    {
        RuleFor(x => x.FundName).NotEmpty().MaximumLength(300);
        RuleFor(x => x.FundCode).NotEmpty().MaximumLength(20);
        RuleFor(x => x.MonthlyAmount).GreaterThan(0);
        RuleFor(x => x.SipDate).InclusiveBetween(1, 28);
        RuleFor(x => x.BenchmarkIndex).NotEmpty().MaximumLength(100);
    }
}
