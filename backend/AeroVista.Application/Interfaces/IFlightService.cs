using AeroVista.Application.DTOs;

namespace AeroVista.Application.Interfaces;

public interface IFlightService
{
    Task<IEnumerable<FlightSearchResultDto>> SearchAsync(FlightSearchRequest req, CancellationToken ct = default);
    Task<FlightSearchResultDto?> GetByIdAsync(Guid id, CancellationToken ct = default);
}