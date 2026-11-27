using System.ComponentModel.DataAnnotations;

public class FlightSearchResultDto
{
    public Guid Id { get; set; }
    public string AirlineName { get; set; } = string.Empty;
    public string FlightNumber { get; set; } = string.Empty;
    public string OriginCode { get; set; } = string.Empty;
    public string OriginCity { get; set; } = string.Empty;
    public string DestinationCode { get; set; } = string.Empty;
    public string DestinationCity { get; set; } = string.Empty;
    public string DepartureTime { get; set; } = string.Empty;   // "19:30"
    public string ArrivalTime { get; set; } = string.Empty;     // "07:30 +1"
    public int DurationMinutes { get; set; }
    public string DurationLabel => $"{DurationMinutes / 60}h {DurationMinutes % 60:D2}m";
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string CabinClass { get; set; } = string.Empty;
    public bool Nonstop { get; set; } = true;
}