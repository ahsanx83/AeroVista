using System.ComponentModel.DataAnnotations;

namespace AeroVista.Application.DTOs;

public class RegisterRequest
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string Password { get; set; } = string.Empty;

    [Required]
    public string PreferredCabin { get; set; } = "Economy";

    [Required, StringLength(3, MinimumLength = 3)]
    public string HomeAirport { get; set; } = "JFK";
}