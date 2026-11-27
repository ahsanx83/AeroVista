using AeroVista.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace AeroVista.Infrastructure;

public class HoldCleanupService : BackgroundService
{
    private readonly IServiceScopeFactory _scope;
    public HoldCleanupService(IServiceScopeFactory scope) => _scope = scope;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            using var s = _scope.CreateScope();
            var db = s.ServiceProvider.GetRequiredService<AppDbContext>();
            var now = DateTime.UtcNow;

            var expired = await db.Bookings
                .Include(b => b.Flight)
                .Where(b => b.Status == "Held" && b.HoldExpiresAt < now)
                .ToListAsync(ct);

            foreach (var b in expired)
            {
                b.Status = "Expired";
                b.Flight.AvailableSeats += 1;
            }
            if (expired.Count > 0) await db.SaveChangesAsync(ct);
            await Task.Delay(TimeSpan.FromMinutes(1), ct);
        }
    }
}