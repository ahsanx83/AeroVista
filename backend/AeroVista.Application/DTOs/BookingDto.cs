using System.ComponentModel.DataAnnotations;

public class BookingDto
{
    public Guid Id { get; set; }
    public string Reference { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string PassengerName { get; set; } = string.Empty;
    public string PassengerEmail { get; set; } = string.Empty;
    public string AirlineName { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string OriginCode { get; set; } = string.Empty;
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCode { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public int DurationMinutes { get; set; }
    public decimal TotalPaid { get; set; }
    public string Currency { get; set; } = "USD";
    public string CabinClass { get; set; } = string.Empty;
    public DateTime? HoldExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; }
}