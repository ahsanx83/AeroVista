using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AeroVista.API.Controllers;


[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;
    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req, CancellationToken ct)
    {
        try { return Ok(await _auth.RegisterAsync(req, ct)); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req, CancellationToken ct)
    {
        try { return Ok(await _auth.LoginAsync(req, requiredRole: null, ct)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [HttpPost("admin/login")]
    public async Task<ActionResult<AuthResponse>> AdminLogin(LoginRequest req, CancellationToken ct)
    {
        try { return Ok(await _auth.LoginAsync(req, requiredRole: "Admin", ct)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest req, CancellationToken ct)
    {
        try { return Ok(await _auth.RefreshAsync(req.RefreshToken, ct)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { error = ex.Message }); }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] RefreshRequest req)
    {
        var uid = Guid.Parse(User.FindFirst("uid")!.Value);
        await _auth.LogoutAsync(uid, req.RefreshToken);
        return NoContent();
    }
}

public class RefreshRequest { public string RefreshToken { get; set; } = string.Empty; }