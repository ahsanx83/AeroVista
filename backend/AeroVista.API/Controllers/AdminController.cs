using Microsoft.EntityFrameworkCore;
using AeroVista.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

using AeroVista.Application.DTOs;
using AeroVista.Infrastructure.Persistence;

namespace AeroVista.API.Controllers;


[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IBookingService _bookings;
    private readonly AppDbContext _db;
    public AdminController(IBookingService bookings, AppDbContext db) { _bookings = bookings; _db = db; }

    // Concurrency race test
    [HttpPost("simulate-race")]
    public async Task<ActionResult<RaceTestResultDto>> SimulateRace([FromBody] RaceRequest req, CancellationToken ct)
        => Ok(await _bookings.SimulateRaceAsync(req.FlightId, req.Users, ct));

    // Basic stats for admin dashboard
    [HttpGet("stats")]
    public async Task<IActionResult> Stats()
    {
        var users = await _db.Users.CountAsync();
        var bookings = await _db.Bookings.CountAsync();
        var confirmed = await _db.Bookings.CountAsync(b => b.Status == "Confirmed");
        var revenue = await _db.Bookings.Where(b => b.Status == "Confirmed")
                                        .SumAsync(b => (decimal?)b.TotalPaid) ?? 0m;
        return Ok(new { users, bookings, confirmed, revenue });
    }
}

public class RaceRequest { public Guid FlightId { get; set; } public int Users { get; set; } = 50; }