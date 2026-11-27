import { RoleGate } from "@/components/role-gate";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, CircleAlert, LogOut, Plane, ShieldCheck, Ticket } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { sampleFlights } from "@/lib/airport-data";
import { logout } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { loadSavedTickets } from "@/lib/saved-tickets";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const Route = createFileRoute("/admin-dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard | AeroVista" },
      {
        name: "description",
        content: "AeroVista administrator overview of flights, bookings and revenue (demo).",
      },
      { property: "og:title", content: "Admin Dashboard | AeroVista" },
      {
        property: "og:description",
        content: "AeroVista administrator overview of flights, bookings and revenue (demo).",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <AdminDashboard />,
});
function AdminDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const signedIn = Boolean(localStorage.getItem("accessToken"));

  const admin = user?.role === "Admin";

  const [tickets, setTickets] = useState([]);
  useEffect(() => {
    setTickets(loadSavedTickets());
  }, []);
  const revenue = tickets.reduce((s, t) => s + t.total, 0);
  const bookedByFlight = (num) =>
    tickets.filter((t) => t.flightNumber === num).reduce((s, t) => s + t.passengers, 0);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BookingHeader />
      <main className="mx-auto max-w-7xl px-4 pt-10 md:px-8">
        {!admin ? (
          <div className="mx-auto max-w-md rounded-lg border border-dashed border-border p-10 text-center">
            <ShieldCheck aria-hidden="true" className="mx-auto size-8 text-primary" />
            <h1 className="mt-3 font-display text-3xl">Admins only</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in as an administrator to view the dashboard.
            </p>
            <Button asChild className="mt-5">
              <Link to="/admin">Admin sign in</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <ShieldCheck aria-hidden="true" className="size-4" /> Administrator ·{" "}
                  {user?.email}
                </p>
                <h1 className="mt-2 font-display text-4xl">Operations dashboard</h1>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/concurrency-test">
                    <Activity aria-hidden="true" /> Concurrency test
                  </Link>
                </Button>
                {/* <Button
                  onClick={() => {
                    logout();
                    void navigate({ to: "/admin" });
                  }}
                  variant="ghost"
                >
                  <LogOut aria-hidden="true" /> Sign out
                </Button> */}
              </div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <CircleAlert aria-hidden="true" className="size-4 text-accent-foreground" /> Demo
              admin view using sample flights and tickets saved in this browser.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat
                icon={<Plane className="size-4" />}
                label="Active flights"
                value={String(sampleFlights.length)}
              />
              <Stat
                icon={<Ticket className="size-4" />}
                label="Bookings"
                value={String(tickets.length)}
              />
              <Stat
                icon={<Ticket className="size-4" />}
                label="Passengers"
                value={String(tickets.reduce((s, t) => s + t.passengers, 0))}
              />
              <Stat
                icon={<Activity className="size-4" />}
                label="Revenue (example)"
                value={money.format(revenue)}
              />
            </div>

            <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr]">
              <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <h2 className="border-b border-border p-5 font-display text-2xl">Flights</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted text-left text-xs text-muted-foreground">
                      <tr>
                        <th className="p-3">Flight</th>
                        <th className="p-3">Route</th>
                        <th className="p-3">Departs</th>
                        <th className="p-3 text-right">Fare</th>
                        <th className="p-3 text-right">Booked</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {sampleFlights.map((f) => (
                        <tr key={f.id}>
                          <td className="p-3 font-semibold">
                            {f.flightNumber}
                            <span className="block text-xs font-normal text-muted-foreground">
                              {f.airline}
                            </span>
                          </td>
                          <td className="p-3">
                            {f.originCode} → {f.destinationCode}
                          </td>
                          <td className="p-3">{f.departureTime}</td>
                          <td className="p-3 text-right">{money.format(f.fare)}</td>
                          <td className="p-3 text-right">{bookedByFlight(f.flightNumber)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h2 className="font-display text-2xl">Recent bookings</h2>
                {tickets.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    No bookings saved in this browser yet.
                  </p>
                ) : (
                  <ul className="mt-4 divide-y divide-border">
                    {tickets.slice(0, 8).map((t) => (
                      <li key={t.reference} className="flex justify-between gap-3 py-3 text-sm">
                        <div>
                          <p className="font-semibold">{t.passengerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {t.flightNumber} · {t.originCode} → {t.destinationCode}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">{t.reference}</p>
                          <p className="text-xs text-muted-foreground">{money.format(t.total)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </main>
      <BookingFooter />
    </div>
  );
}
function Stat({ icon, label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}
