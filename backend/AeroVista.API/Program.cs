using System.Text;
using AeroVista.Application.DTOs;
using AeroVista.Application.Interfaces;
using AeroVista.Infrastructure.Persistence;
using AeroVista.Infrastructure.Security;
using AeroVista.Infrastructure.Services;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using AeroVista.Infrastructure;


var builder = WebApplication.CreateBuilder(args);

// var serverVersion = new MySqlServerVersion(new Version(5, 5, 62));

// builder.Services.AddDbContext<AppDbContext>(options =>
//     options.UseMySql(
//         builder.Configuration.GetConnectionString("DefaultConnection"),
//         serverVersion // <-- Replace the original AutoDetect with this
//     ));

// 1. MySQL via Pomelo (XAMPP)
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
                 ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

// 2. DI — Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IFlightService, FlightService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddSingleton<JwtTokenGenerator>();
builder.Services.AddHostedService<HoldCleanupService>();

// 3. Validation
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<BookingRequest>();

// 4. JWT Auth
var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

// 5. CORS for React (localhost:5173 or 3000)
builder.Services.AddCors(o => o.AddPolicy("React", p =>
    p.WithOrigins("http://localhost:3000", "http://localhost:5173", "http://localhost:8080",
        "http://127.0.0.1:8080", "https://aeroxvista.lovable.app/")
     .AllowAnyHeader().AllowAnyMethod().AllowCredentials()));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 6. Seed admin + flights on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbSeeder.SeedAsync(db);
}

app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("React");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();