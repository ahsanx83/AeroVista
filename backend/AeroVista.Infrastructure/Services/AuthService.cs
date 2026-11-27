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


public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly JwtTokenGenerator _jwt;
    private readonly IConfiguration _cfg;

    public AuthService(AppDbContext db, JwtTokenGenerator jwt, IConfiguration cfg)
    { _db = db; _jwt = jwt; _cfg = cfg; }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest r, CancellationToken ct = default)
    {
        if (await _db.Users.AnyAsync(u => u.Email == r.Email.ToLower(), ct))
            throw new InvalidOperationException("Email already registered.");

        var user = new User
        {
            FullName = r.FullName, Email = r.Email.ToLower(),
            PasswordHash = BC.HashPassword(r.Password),
            PreferredCabin = r.PreferredCabin,
            HomeAirport = r.HomeAirport.ToUpper(),
            Role = "Customer"
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);
        return await IssueTokens(user, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest r, string? requiredRole = null, CancellationToken ct = default)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == r.Email.ToLower(), ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");
        if (!BC.Verify(r.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid credentials.");
        if (requiredRole != null && user.Role != requiredRole)
            throw new UnauthorizedAccessException($"Access denied. Requires {requiredRole} role.");

        return await IssueTokens(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string token, CancellationToken ct = default)
    {
        var rt = await _db.RefreshTokens.Include(x => x.User)
            .FirstOrDefaultAsync(x => x.Token == token && !x.IsRevoked, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");
        if (rt.ExpiresAt < DateTime.UtcNow) throw new UnauthorizedAccessException("Refresh token expired.");
        rt.IsRevoked = true;
        await _db.SaveChangesAsync(ct);
        return await IssueTokens(rt.User, ct);
    }

    public async Task LogoutAsync(Guid userId, string token, CancellationToken ct = default)
    {
        var rt = await _db.RefreshTokens.FirstOrDefaultAsync(x => x.Token == token && x.UserId == userId, ct);
        if (rt != null) { rt.IsRevoked = true; await _db.SaveChangesAsync(ct); }
    }

    public async Task<UserProfileDto?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var u = await _db.Users.FindAsync(new object[] { userId }, ct);
        if (u is null) return null;
        var count = await _db.Bookings.CountAsync(b => b.UserId == userId && b.Status == "Confirmed", ct);
        return new UserProfileDto
        {
            Id = u.Id, FullName = u.FullName, Email = u.Email, Phone = u.Phone,
            PreferredCabin = u.PreferredCabin, HomeAirport = u.HomeAirport,
            Role = u.Role, MemberSince = u.MemberSince, SavedTicketsCount = count
        };
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(Guid userId, UpdateProfileRequest r, CancellationToken ct = default)
    {
        var u = await _db.Users.FindAsync(new object[] { userId }, ct);
        if (u is null) return null;
        u.FullName = r.FullName;
        if (!string.IsNullOrWhiteSpace(r.Email)) u.Email = r.Email.ToLower();
        u.Phone = r.Phone;
        u.PreferredCabin = r.PreferredCabin;
        u.HomeAirport = r.HomeAirport.ToUpper();
        await _db.SaveChangesAsync(ct);
        return await GetProfileAsync(userId, ct);
    }

    private async Task<AuthResponse> IssueTokens(User user, CancellationToken ct)
    {
        var (access, expires) = _jwt.GenerateAccessToken(user);
        var refresh = _jwt.GenerateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id, Token = refresh,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        });
        await _db.SaveChangesAsync(ct);

        return new AuthResponse
        {
            AccessToken = access, RefreshToken = refresh, ExpiresAt = expires,
            User = new UserProfileDto
            {
                Id = user.Id, FullName = user.FullName, Email = user.Email, Phone = user.Phone,
                PreferredCabin = user.PreferredCabin, HomeAirport = user.HomeAirport,
                Role = user.Role, MemberSince = user.MemberSince
            }
        };
    }
}