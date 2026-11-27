using AeroVista.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using BC = BCrypt.Net.BCrypt;

namespace AeroVista.Infrastructure.Persistence;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        await db.Database.MigrateAsync();

        if (!await db.Users.AnyAsync(u => u.Role == "Admin"))
        {
            db.Users.Add(new User
            {
                FullName = "Administrator",
                Email = "admin@aerovista.local",
                PasswordHash = BC.HashPassword("Admin@123!"),
                Role = "Admin",
                HomeAirport = "JFK",
                PreferredCabin = "Business"
            });
            await db.SaveChangesAsync();
        }
    }
}