# ✈️ AeroVista — Airline Reservation API

A production-style **ASP.NET Core 9** backend for a flight booking platform. Features a concurrency-safe booking engine, idempotent seat holds, JWT authentication with role-based authorization, and a Clean Architecture design.

![.NET](https://img.shields.io/badge/.NET-9.0-512BD4?logo=dotnet)
![MySQL](https://img.shields.io/badge/MySQL-8.x-4479A1?logo=mysql)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 🎯 Highlights

- 🔒 **Concurrency-safe booking** — optimistic locking via EF Core `RowVersion`; verified only **1 of 50** simultaneous bookings succeeds
- 🔁 **Idempotent holds** — `Idempotency-Key` header prevents duplicate bookings on retry
- ⏱️ **TTL-based seat holds** — unpaid bookings auto-expire after 15 minutes via a background worker
- 🧱 **Clean Architecture** — Domain / Application / Infrastructure / API, with strict dependency rule
- 🔑 **JWT auth + refresh tokens** — role-based access (Admin / Customer)
- 🧪 **Built-in race-condition test** — admin-only endpoint spins up N concurrent bookings and reports how many succeeded
- 📖 **Swagger UI** — full OpenAPI docs at `/swagger`

---

## 🏗️ Architecture
```
AeroVista/
├── AeroVista.Domain/ # Entities, enums (no dependencies)
│ └── Entities/ # User, Flight, Booking, RefreshToken
│
├── AeroVista.Application/ # Contracts only
│ ├── DTOs/ # Request/response shapes
│ ├── Interfaces/ # IAuthService, IBookingService, IFlightService
│ └── Validators/ # FluentValidation rules
│
├── AeroVista.Infrastructure/ # Implementations
│ ├── Persistence/ # AppDbContext, DbSeeder, Migrations
│ ├── Security/ # JwtTokenGenerator
│ ├── Services/ # AuthService, BookingService, FlightService
│ └── HoldCleanupService.cs # Background worker (IHostedService)
│
└── AeroVista.API/ # HTTP layer
├── Controllers/ # Auth, Profile, Flights, Bookings, Admin
└── Program.cs # DI, JWT, CORS, Swagger
```

**Dependency direction:** `API → Infrastructure → Application → Domain` (no reverse references).

---

## 🔌 API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/register` | ❌ | Customer registration |
| POST | `/login` | ❌ | Customer login |
| POST | `/admin/login` | ❌ | Admin login |
| POST | `/refresh` | ❌ | Refresh access token |
| POST | `/logout` | ✅ | Revoke refresh token |

### Profile — `/api/profile`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | ✅ | Get current profile |
| PUT | `/` | ✅ | Update profile |
| GET | `/summary` | ✅ | Dashboard stats |

### Flights — `/api/flights`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/search` | ❌ | Search flights by route/date |
| GET | `/{id}` | ❌ | Get single flight |

### Bookings — `/api/bookings`
| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/hold` | Optional | Create held booking (15-min TTL) |
| POST | `/{id}/confirm` | Optional | Confirm held booking |
| POST | `/{id}/cancel` | ✅ | Cancel & free seat |
| GET | `/my` | ✅ | List my bookings |
| GET | `/reference/{ref}` | ❌ | Look up by ticket reference |

### Admin — `/api/admin` *(Admin role required)*
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/simulate-race` | Concurrency stress test |
| GET | `/stats` | Users, bookings, revenue |

---

## 🚀 Local Setup

### Prerequisites

- [.NET 9 SDK](https://dotnet.microsoft.com/download)
- [XAMPP](https://www.apachefriends.org/) (MySQL on `localhost:3306`)
- [EF Core CLI](https://learn.microsoft.com/ef/core/cli/dotnet): `dotnet tool install --global dotnet-ef`

### 1. Clone & restore

```bash
git clone https://github.com/YOUR_USERNAME/AeroVista.git
cd AeroVista
dotnet restore
```

### 2. Configure appsettings.json
Edit AeroVista.API/appsettings.json:
```
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Port=3306;Database=aerovista_db;User=root;Password=;"
  },
  "Jwt": {
    "Key": "AeroVista_Secret_Key_Change_Me_At_Least_32_Chars_Long!",
    "Issuer": "AeroVista",
    "Audience": "AeroVistaUsers"
  }
}
```

### 3. Apply migrations
```
dotnet ef database update --project AeroVista.Infrastructure --startup-project AeroVista.API
```

### 5. Run
```
dotnet run --project AeroVista.API
```
