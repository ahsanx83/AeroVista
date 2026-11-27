using System.ComponentModel.DataAnnotations;

public class FlightSearchRequest
{
    [Required, StringLength(3, MinimumLength = 3)]
    public string From { get; set; } = string.Empty;

    [Required, StringLength(3, MinimumLength = 3)]
    public string To { get; set; } = string.Empty;

    [Required] public DateTime DepartureDate { get; set; }

    [Range(1, 9)] public int Passengers { get; set; } = 1;

    public string CabinClass { get; set; } = "Economy";
}