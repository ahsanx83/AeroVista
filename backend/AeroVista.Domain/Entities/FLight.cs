using System.ComponentModel.DataAnnotations;

namespace AeroVista.Domain.Entities;

public class Flight
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FlightNumber { get; set; } = string.Empty;   // "BA 178"
    public string AirlineName { get; set; } = string.Empty;    // "British Airways"
    public string AirlineCode { get; set; } = string.Empty;    // "BA"
    public string OriginCode { get; set; } = string.Empty;     // "JFK"
    public string OriginCity { get; set; } = string.Empty;     // "New York"
    public string DestinationCode { get; set; } = string.Empty;// "LHR"
    public string DestinationCity { get; set; } = string.Empty;// "London"
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public int DurationMinutes { get; set; }                    // 420
    public string CabinClass { get; set; } = "Economy";
    public decimal Price { get; set; }
    public int TotalSeats { get; set; } = 180;
    public int AvailableSeats { get; set; } = 180;

    [Timestamp]
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}