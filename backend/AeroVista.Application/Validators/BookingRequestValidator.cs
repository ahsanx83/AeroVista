using AeroVista.Application.DTOs;
using FluentValidation;

namespace AeroVista.Application.Validators;

public class BookingRequestValidator : AbstractValidator<BookingRequest>
{
    public BookingRequestValidator()
    {
        RuleFor(x => x.FlightId).NotEmpty();
        RuleFor(x => x.FirstName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.LastName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.CabinClass).Must(c => new[] { "Economy", "Premium", "Business", "First" }.Contains(c));
    }
}