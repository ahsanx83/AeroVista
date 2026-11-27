namespace AeroVista.Domain.Entities;

public class Booking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Reference { get; set; } = GenerateRef();    // "EEU8MT"
    public Guid FlightId { get; set; }
    public Guid? UserId { get; set; }
    public string PassengerFirstName { get; set; } = string.Empty;
    public string PassengerLastName { get; set; } = string.Empty;
    public string PassengerEmail { get; set; } = string.Empty;
    public string SeatPreference { get; set; } = "No preference";
    public string CabinClass { get; set; } = "Economy";
    public string Status { get; set; } = "Held";               // Held | Confirmed | Cancelled | Expired
    public decimal TotalPaid { get; set; }
    public string Currency { get; set; } = "USD";
    public string? IdempotencyKey { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? HoldExpiresAt { get; set; }
    public DateTime? ConfirmedAt { get; set; }

    public Flight Flight { get; set; } = null!;

    private static string GenerateRef()
    {
        const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        var rng = new Random();
        return new string(Enumerable.Repeat(chars, 6).Select(s => s[rng.Next(s.Length)]).ToArray());
    }
}