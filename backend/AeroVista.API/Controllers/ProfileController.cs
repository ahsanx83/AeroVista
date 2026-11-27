using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroVista.API.Controllers;


[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IAuthService _auth;
    private readonly IBookingService _booking;
    public ProfileController(IAuthService auth, IBookingService booking) { _auth = auth; _booking = booking; }

    [HttpGet]
    public async Task<ActionResult<UserProfileDto>> Get(CancellationToken ct)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        var p = await _auth.GetProfileAsync(uid, ct);
        return p is null ? NotFound() : Ok(p);
    }

    [HttpPut]
    public async Task<ActionResult<UserProfileDto>> Update(UpdateProfileRequest req, CancellationToken ct)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        var p = await _auth.UpdateProfileAsync(uid, req, ct);
        return p is null ? NotFound() : Ok(p);
    }

    // Screen 3: "My trips" card stats
    [HttpGet("summary")]
    public async Task<ActionResult<BookingSummaryDto>> Summary(CancellationToken ct)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        return Ok(await _booking.GetSummaryAsync(uid, ct));
    }
}