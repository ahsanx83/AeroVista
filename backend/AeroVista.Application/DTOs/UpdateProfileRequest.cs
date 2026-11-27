using System.ComponentModel.DataAnnotations;

public class UpdateProfileRequest
{
    [Required, MaxLength(100)] public string FullName { get; set; } = string.Empty;
    [EmailAddress] public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    [Required] public string PreferredCabin { get; set; } = "Economy";
    [Required] public string HomeAirport { get; set; } = "JFK";
}