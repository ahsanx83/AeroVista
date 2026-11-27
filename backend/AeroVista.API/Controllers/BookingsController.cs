using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroVista.API.Controllers;


[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookings;
    public BookingsController(IBookingService bookings) => _bookings = bookings;

    // Screen 5: "Your passenger details" → Hold a seat
    [HttpPost("hold")]
    [AllowAnonymous]
    public async Task<ActionResult<BookingDto>> Hold(
        BookingRequest req,
        [FromHeader(Name = "Idempotency-Key")] string? idemKey,
        CancellationToken ct)
    {
        idemKey ??= Guid.NewGuid().ToString();
        Guid? uid = User.Identity?.IsAuthenticated == true
            ? Guid.Parse(User.FindFirst("uid")!.Value) : null;

        try { return Ok(await _bookings.HoldAsync(req, idemKey, uid, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return Conflict(new { error = ex.Message }); }
    }

    // Screen 6: "Confirm reservation" button
    [HttpPost("{id:guid}/confirm")]
    [AllowAnonymous]
    public async Task<ActionResult<BookingDto>> Confirm(Guid id, CancellationToken ct)
    {
        Guid? uid = User.Identity?.IsAuthenticated == true
            ? Guid.Parse(User.FindFirst("uid")!.Value) : null;
        try { return Ok(await _bookings.ConfirmAsync(id, uid, ct)); }
        catch (KeyNotFoundException ex) { return NotFound(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    // Screen 4: "Save ticket" / Cancel
    [HttpPost("{id:guid}/cancel")]
    public async Task<IActionResult> Cancel(Guid id, CancellationToken ct)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        try { return await _bookings.CancelAsync(id, uid, ct) ? NoContent() : NotFound(); }
        catch (UnauthorizedAccessException) { return Forbid(); }
    }

    // Screen 2 & 3: "My trips" / "My saved tickets"
    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<BookingDto>>> MyBookings(CancellationToken ct)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        return Ok(await _bookings.GetUserBookingsAsync(uid, ct));
    }

    // Screen 4: Look up ticket by reference (EEU8MT)
    [HttpGet("reference/{reference}")]
    [AllowAnonymous]
    public async Task<ActionResult<BookingDto>> ByReference(string reference, CancellationToken ct)
    {
        var b = await _bookings.GetByReferenceAsync(reference.ToUpper(), ct);
        return b is null ? NotFound() : Ok(b);
    }
}