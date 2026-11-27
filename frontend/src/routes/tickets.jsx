import { createFileRoute, Link } from "@tanstack/react-router";
import { Plane, Printer, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { loadSavedTickets, removeTicket } from "@/lib/saved-tickets";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const Route = createFileRoute("/tickets")({
  head: () => ({
    meta: [
      { title: "My Saved Tickets | AeroVista" },
      {
        name: "description",
        content: "Revisit and print demo AeroVista e-tickets saved in this browser.",
      },
      { property: "og:title", content: "My Saved Tickets | AeroVista" },
      {
        property: "og:description",
        content: "Revisit and print demo AeroVista e-tickets saved in this browser.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: TicketsPage,
});
function TicketsPage() {
  const [tickets, setTickets] = useState(null);
  const [printRef, setPrintRef] = useState(null);
  useEffect(() => setTickets(loadSavedTickets()), []);
  useEffect(() => {
    if (!printRef) return;
    const done = () => setPrintRef(null);
    window.addEventListener("afterprint", done);
    window.print();
    return () => window.removeEventListener("afterprint", done);
  }, [printRef]);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="print:hidden">
        <BookingHeader />
      </div>
      <main className="mx-auto max-w-5xl px-4 pt-10 md:px-8">
        <div className="mb-6 print:hidden">
          <h1 className="font-display text-4xl">My saved tickets</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Demo tickets stored only in this browser. Clearing browser data removes them.
          </p>
        </div>
        {tickets === null ? null : tickets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <p className="text-muted-foreground">No saved tickets yet.</p>
            <Button asChild className="mt-4">
              <Link to="/">Find a flight</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-6">
            {tickets.map((t) => (
              <li
                key={t.reference}
                className={`overflow-hidden rounded-lg border border-border bg-card shadow-sm ${printRef && printRef !== t.reference ? "print:hidden" : ""}`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3 bg-primary px-5 py-4 text-primary-foreground">
                  <p className="font-semibold">
                    {t.airline} {t.flightNumber}
                  </p>
                  <p className="font-mono text-xl font-bold tracking-widest">{t.reference}</p>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
                  <div>
                    <p className="font-display text-3xl">{t.originCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.originCity} · {t.departureTime}
                    </p>
                  </div>
                  <div className="flex flex-col items-center text-xs text-muted-foreground">
                    <Plane aria-hidden="true" className="size-5 text-primary" />
                    {t.duration}
                  </div>
                  <div className="sm:text-right">
                    <p className="font-display text-3xl">{t.destinationCode}</p>
                    <p className="text-sm text-muted-foreground">
                      {t.destinationCity} · {t.arrivalTime}
                      {t.arrivalDayOffset > 0 ? ` +${t.arrivalDayOffset}` : ""}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-dashed border-border p-5 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Passenger</p>
                    <p className="font-semibold">{t.passengerName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-semibold">{t.travelDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Seat · Travelers</p>
                    <p className="font-semibold capitalize">
                      {t.seatPreference} · {t.passengers}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total (example)</p>
                    <p className="font-semibold">{money.format(t.total)} USD</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 border-t border-border p-4 print:hidden">
                  <Button onClick={() => setPrintRef(t.reference)} size="sm" variant="outline">
                    <Printer aria-hidden="true" /> Print
                  </Button>
                  <Button
                    onClick={() => setTickets(removeTicket(t.reference))}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 aria-hidden="true" /> Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <div className="print:hidden">
        <BookingFooter />
      </div>
    </div>
  );
}
