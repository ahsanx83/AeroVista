using System.ComponentModel.DataAnnotations;

public class UserProfileDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string PreferredCabin { get; set; } = string.Empty;
    public string HomeAirport { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public DateTime MemberSince { get; set; }
    public int SavedTicketsCount { get; set; }
}