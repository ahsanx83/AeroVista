using System.ComponentModel.DataAnnotations;
public class BookingSummaryDto
{
    public int SavedTicketsCount { get; set; }
    public string HomeAirport { get; set; } = string.Empty;
    public string PreferredCabin { get; set; } = string.Empty;
}