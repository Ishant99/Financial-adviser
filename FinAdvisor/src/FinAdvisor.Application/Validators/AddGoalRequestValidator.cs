using FinAdvisor.Application.DTOs;
using FluentValidation;

namespace FinAdvisor.Application.Validators;

public class AddGoalRequestValidator : AbstractValidator<AddGoalRequest>
{
    public AddGoalRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TargetAmount).GreaterThan(0);
        RuleFor(x => x.Priority).InclusiveBetween(1, 5);
        RuleFor(x => x.TargetAssetAllocation).NotNull().SetValidator(new AssetAllocationDtoValidator());
    }
}

public class UpdateGoalRequestValidator : AbstractValidator<UpdateGoalRequest>
{
    public UpdateGoalRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.TargetAmount).GreaterThan(0);
        RuleFor(x => x.Priority).InclusiveBetween(1, 5);
        RuleFor(x => x.TargetAssetAllocation).NotNull().SetValidator(new AssetAllocationDtoValidator());
    }
}

public class AssetAllocationDtoValidator : AbstractValidator<AssetAllocationDto>
{
    public AssetAllocationDtoValidator()
    {
        RuleFor(x => x.EquityPercent).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
        RuleFor(x => x.DebtPercent).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
        RuleFor(x => x.GoldPercent).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
        RuleFor(x => x.CashPercent).GreaterThanOrEqualTo(0).LessThanOrEqualTo(100);
        RuleFor(x => x)
            .Must(a => Math.Abs(a.EquityPercent + a.DebtPercent + a.GoldPercent + a.CashPercent - 100m) < 0.01m)
            .WithMessage("Asset allocation percentages must sum to 100.");
    }
}
