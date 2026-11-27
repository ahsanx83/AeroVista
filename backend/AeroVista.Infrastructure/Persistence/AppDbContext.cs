using AeroVista.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AeroVista.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> o) : base(o) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Flight> Flights => Set<Flight>();
    public DbSet<Booking> Bookings => Set<Booking>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();
        mb.Entity<Booking>().HasIndex(b => b.Reference).IsUnique();
        mb.Entity<Booking>().HasIndex(b => b.IdempotencyKey);
        mb.Entity<Flight>().Property(f => f.RowVersion).IsRowVersion();

        var d = new DateTime(2026, 11, 30, 0, 0, 0, DateTimeKind.Utc);
        mb.Entity<Flight>().HasData(
            new Flight
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                AirlineName = "British Airways", AirlineCode = "BA", FlightNumber = "BA 178",
                OriginCode = "JFK", OriginCity = "New York",
                DestinationCode = "LHR", DestinationCity = "London",
                DepartureTime = d.AddHours(19).AddMinutes(30),
                ArrivalTime = d.AddDays(1).AddHours(7).AddMinutes(30),
                DurationMinutes = 420, Price = 598m, TotalSeats = 180, AvailableSeats = 180, CabinClass = "Economy"
            },
            new Flight
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                AirlineName = "Virgin Atlantic", AirlineCode = "VS", FlightNumber = "VS 10",
                OriginCode = "JFK", OriginCity = "New York",
                DestinationCode = "LHR", DestinationCity = "London",
                DepartureTime = d.AddHours(21),
                ArrivalTime = d.AddDays(1).AddHours(9).AddMinutes(15),
                DurationMinutes = 435, Price = 642m, TotalSeats = 180, AvailableSeats = 180, CabinClass = "Economy"
            },
            new Flight
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                AirlineName = "American Airlines", AirlineCode = "AA", FlightNumber = "AA 142",
                OriginCode = "JFK", OriginCity = "New York",
                DestinationCode = "LHR", DestinationCity = "London",
                DepartureTime = d.AddHours(22).AddMinutes(25),
                ArrivalTime = d.AddDays(1).AddHours(10).AddMinutes(35),
                DurationMinutes = 430, Price = 724m, TotalSeats = 180, AvailableSeats = 180, CabinClass = "Economy"
            }
        );
    }
}