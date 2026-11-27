namespace AeroVista.Application.DTOs;

public class RaceTestResultDto
{
    public int TotalAttempts { get; set; }
    public int Successful { get; set; }
    public int Failed { get; set; }
    public int SeatsBefore { get; set; }
    public int SeatsAfter { get; set; }
    public string Message { get; set; } = string.Empty;
}