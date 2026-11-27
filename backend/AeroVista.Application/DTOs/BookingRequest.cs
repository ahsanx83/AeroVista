using System.ComponentModel.DataAnnotations;

public class BookingRequest
{
    [Required] public Guid FlightId { get; set; }

    [Required, MaxLength(50)] public string FirstName { get; set; } = string.Empty;
    [Required, MaxLength(50)] public string LastName { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;

    public string SeatPreference { get; set; } = "No preference";
    public string CabinClass { get; set; } = "Economy";
}