using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using AeroVista.Domain.Entities;              // needed for User, Flight, Booking
using AeroVista.Infrastructure.Persistence;   // needed for AppDbContext
using AeroVista.Infrastructure.Security;      // needed for JwtTokenGenerator
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using BC = BCrypt.Net.BCrypt;

namespace AeroVista.Infrastructure.Services;


public class FlightService : IFlightService
{
    private readonly AppDbContext _db;
    public FlightService(AppDbContext db) => _db = db;

    public async Task<IEnumerable<FlightSearchResultDto>> SearchAsync(FlightSearchRequest r, CancellationToken ct = default)
    {
        var start = r.DepartureDate.Date;
        var end = start.AddDays(1);

        var flights = await _db.Flights
            .Where(f => f.OriginCode == r.From.ToUpper()
                     && f.DestinationCode == r.To.ToUpper()
                     && f.DepartureTime >= start && f.DepartureTime < end
                     && f.AvailableSeats >= r.Passengers)
            .OrderBy(f => f.DepartureTime)
            .ToListAsync(ct);

        return flights.Select(Map);
    }

    public async Task<FlightSearchResultDto?> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var f = await _db.Flights.FindAsync(new object[] { id }, ct);
        return f is null ? null : Map(f);
    }

    private static FlightSearchResultDto Map(Flight f) => new()
    {
        Id = f.Id, AirlineName = f.AirlineName, FlightNumber = f.FlightNumber,
        OriginCode = f.OriginCode, OriginCity = f.OriginCity,
        DestinationCode = f.DestinationCode, DestinationCity = f.DestinationCity,
        DepartureTime = f.DepartureTime.ToString("HH:mm"),
        ArrivalTime = f.ArrivalTime.ToString("HH:mm") + (f.ArrivalTime.Date > f.DepartureTime.Date ? " +1" : ""),
        DurationMinutes = f.DurationMinutes,
        Price = f.Price, CabinClass = f.CabinClass,
        Nonstop = true
    };
}