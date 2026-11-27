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


public class BookingService : IBookingService
{
    private readonly AppDbContext _db;
    private readonly ILogger<BookingService> _log;

    public BookingService(AppDbContext db, ILogger<BookingService> log) { _db = db; _log = log; }

    public async Task<BookingDto> HoldAsync(BookingRequest req, string idempotencyKey, Guid? userId, CancellationToken ct = default)
    {
        // 1. Idempotency
        var existing = await _db.Bookings.Include(b => b.Flight)
            .FirstOrDefaultAsync(b => b.IdempotencyKey == idempotencyKey, ct);
        if (existing != null) return Map(existing);

        // 2. Lock flight (optimistic)
        var flight = await _db.Flights.FindAsync(new object[] { req.FlightId }, ct)
            ?? throw new KeyNotFoundException("Flight not found");
        if (flight.AvailableSeats <= 0) throw new InvalidOperationException("No seats available");

        var booking = new Booking
        {
            FlightId = flight.Id,
            UserId = userId,
            PassengerFirstName = req.FirstName,
            PassengerLastName = req.LastName,
            PassengerEmail = req.Email,
            SeatPreference = req.SeatPreference,
            CabinClass = flight.CabinClass,
            Status = "Held",
            TotalPaid = flight.Price,
            HoldExpiresAt = DateTime.UtcNow.AddMinutes(15),
            IdempotencyKey = idempotencyKey
        };

        flight.AvailableSeats -= 1;
        _db.Bookings.Add(booking);

        try { await _db.SaveChangesAsync(ct); }
        catch (DbUpdateConcurrencyException)
        {
            _log.LogWarning("Concurrency conflict on flight {FlightId}", flight.Id);
            throw new InvalidOperationException("Seat was taken by another user. Try again.");
        }

        booking.Flight = flight;
        return Map(booking);
    }

    public async Task<BookingDto> ConfirmAsync(Guid bookingId, Guid? userId, CancellationToken ct = default)
    {
        var b = await _db.Bookings.Include(x => x.Flight)
            .FirstOrDefaultAsync(x => x.Id == bookingId, ct)
            ?? throw new KeyNotFoundException("Booking not found");

        if (b.Status == "Confirmed") return Map(b);
        if (b.Status != "Held") throw new InvalidOperationException("Booking cannot be confirmed.");
        if (userId.HasValue && b.UserId.HasValue && b.UserId != userId) throw new UnauthorizedAccessException();

        b.Status = "Confirmed";
        b.ConfirmedAt = DateTime.UtcNow;
        b.HoldExpiresAt = null;
        await _db.SaveChangesAsync(ct);
        return Map(b);
    }

    public async Task<bool> CancelAsync(Guid bookingId, Guid? userId, CancellationToken ct = default)
    {
        var b = await _db.Bookings.Include(x => x.Flight)
            .FirstOrDefaultAsync(x => x.Id == bookingId, ct);
        if (b is null) return false;
        if (userId.HasValue && b.UserId.HasValue && b.UserId != userId) throw new UnauthorizedAccessException();

        if (b.Status is "Held" or "Confirmed")
        {
            b.Status = "Cancelled";
            b.Flight.AvailableSeats += 1;
            await _db.SaveChangesAsync(ct);
        }
        return true;
    }

    public async Task<IEnumerable<BookingDto>> GetUserBookingsAsync(Guid userId, CancellationToken ct = default)
        => await _db.Bookings.Include(b => b.Flight)
            .Where(b => b.UserId == userId && b.Status != "Expired")
            .OrderByDescending(b => b.CreatedAt)
            .Select(b => Map(b))
            .ToListAsync(ct);

    public async Task<BookingDto?> GetByReferenceAsync(string reference, CancellationToken ct = default)
    {
        var b = await _db.Bookings.Include(x => x.Flight)
            .FirstOrDefaultAsync(x => x.Reference == reference, ct);
        return b is null ? null : Map(b);
    }

    public async Task<BookingSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _db.Users.FindAsync(new object[] { userId }, ct)
            ?? throw new KeyNotFoundException();
        var count = await _db.Bookings.CountAsync(b => b.UserId == userId && b.Status == "Confirmed", ct);
        return new BookingSummaryDto
        {
            SavedTicketsCount = count,
            HomeAirport = user.HomeAirport,
            PreferredCabin = user.PreferredCabin
        };
    }

    public async Task<RaceTestResultDto> SimulateRaceAsync(Guid flightId, int users, CancellationToken ct = default)
    {
        var flight = await _db.Flights.FindAsync(new object[] { flightId }, ct)
            ?? throw new KeyNotFoundException("Flight not found");

        var results = new List<(bool success, string msg)>();
        var tasks = Enumerable.Range(0, users).Select(async i =>
        {
            using var scope = _db.Database.BeginTransaction();
            try
            {
                var svc = new BookingService(_db, _log);
                var req = new BookingRequest
                {
                    FlightId = flightId,
                    FirstName = $"User", LastName = $"Test{i}",
                    Email = $"race{i}@test.local",
                    SeatPreference = "No preference",
                    CabinClass = flight.CabinClass
                };
                await svc.HoldAsync(req, Guid.NewGuid().ToString(), null, ct);
                await scope.CommitAsync(ct);
                lock (results) results.Add((true, "OK"));
            }
            catch (Exception ex)
            {
                await scope.RollbackAsync(ct);
                lock (results) results.Add((false, ex.Message));
            }
        });

        await Task.WhenAll(tasks);
        var ok = results.Count(r => r.success);
        return new RaceTestResultDto
        {
            TotalAttempts = users,
            Successful = ok,
            Failed = users - ok,
            SeatsBefore = flight.AvailableSeats + ok,
            SeatsAfter = flight.AvailableSeats,
            Message = ok <= 1 ? "✅ Concurrency OK — only one booking succeeded" : "❌ Race condition detected!"
        };
    }

    private static BookingDto Map(Booking b) => new()
    {
        Id = b.Id, Reference = b.Reference, Status = b.Status,
        PassengerName = $"{b.PassengerFirstName} {b.PassengerLastName}".Trim(),
        PassengerEmail = b.PassengerEmail,
        AirlineName = b.Flight.AirlineName, FlightNumber = b.Flight.FlightNumber,
        OriginCode = b.Flight.OriginCode, OriginCity = b.Flight.OriginCity,
        DestinationCode = b.Flight.DestinationCode, DestinationCity = b.Flight.DestinationCity,
        DepartureTime = b.Flight.DepartureTime, ArrivalTime = b.Flight.ArrivalTime,
        DurationMinutes = b.Flight.DurationMinutes,
        TotalPaid = b.TotalPaid, Currency = b.Currency,
        CabinClass = b.CabinClass, HoldExpiresAt = b.HoldExpiresAt, CreatedAt = b.CreatedAt
    };
}
