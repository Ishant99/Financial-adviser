using FinAdvisor.Application.DTOs;
using FinAdvisor.Domain.Enums;
using FluentValidation;

namespace FinAdvisor.Application.Validators;

public class AddHoldingRequestValidator : AbstractValidator<AddHoldingRequest>
{
    public AddHoldingRequestValidator()
    {
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.HoldingType)
            .NotEmpty()
            .Must(v => Enum.TryParse<HoldingType>(v, ignoreCase: true, out _))
            .WithMessage("Invalid holding type.");
        RuleFor(x => x.Units).GreaterThanOrEqualTo(0);
        RuleFor(x => x.PurchaseNav).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CurrentNav).GreaterThanOrEqualTo(0);
    }
}
