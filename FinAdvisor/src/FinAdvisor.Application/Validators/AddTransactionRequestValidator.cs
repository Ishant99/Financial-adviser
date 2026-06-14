using FinAdvisor.Application.DTOs;
using FinAdvisor.Domain.Enums;
using FluentValidation;

namespace FinAdvisor.Application.Validators;

public class AddTransactionRequestValidator : AbstractValidator<AddTransactionRequest>
{
    public AddTransactionRequestValidator()
    {
        RuleFor(x => x.AccountId).NotEmpty();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Category).NotEmpty().MaximumLength(100);
        RuleFor(x => x.TransactionType)
            .NotEmpty()
            .Must(v => Enum.TryParse<TransactionType>(v, ignoreCase: true, out _))
            .WithMessage("Invalid transaction type.");
    }
}
