using AeroVista.Application.DTOs;

namespace AeroVista.Application.Interfaces;

public interface IBookingService
{
    Task<BookingDto> HoldAsync(BookingRequest req, string idempotencyKey, Guid? userId, CancellationToken ct = default);
    Task<BookingDto> ConfirmAsync(Guid bookingId, Guid? userId, CancellationToken ct = default);
    Task<bool> CancelAsync(Guid bookingId, Guid? userId, CancellationToken ct = default);
    Task<IEnumerable<BookingDto>> GetUserBookingsAsync(Guid userId, CancellationToken ct = default);
    Task<BookingDto?> GetByReferenceAsync(string reference, CancellationToken ct = default);
    Task<BookingSummaryDto> GetSummaryAsync(Guid userId, CancellationToken ct = default);
    Task<RaceTestResultDto> SimulateRaceAsync(Guid flightId, int users, CancellationToken ct = default);
}