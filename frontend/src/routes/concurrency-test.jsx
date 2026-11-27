import { RoleGate } from "@/components/role-gate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowLeft, CheckCircle2, Play, XCircle } from "lucide-react";
import { useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { randomDelay, runConcurrencyTest } from "@/lib/booking-concurrency";
export const Route = createFileRoute("/concurrency-test")({
  head: () => ({
    meta: [
      { title: "Booking Concurrency Test | AeroVista" },
      {
        name: "description",
        content:
          "Simulate many travelers booking the last seats at once and compare locking strategies.",
      },
      { property: "og:title", content: "Booking Concurrency Test | AeroVista" },
      {
        property: "og:description",
        content:
          "Simulate many travelers booking the last seats at once and compare locking strategies.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <RoleGate role="admin">
      <ConcurrencyPage />
    </RoleGate>
  ),
});
function ConcurrencyPage() {
  const [capacity, setCapacity] = useState("10");
  const [clients, setClients] = useState("50");
  const [error, setError] = useState("");
  const [running, setRunning] = useState(false);
  const [reports, setReports] = useState([]);
  async function run() {
    const cap = Number(capacity),
      cl = Number(clients);
    if (!Number.isInteger(cap) || cap < 1 || cap > 500)
      return setError("Seats must be a whole number from 1 to 500.");
    if (!Number.isInteger(cl) || cl < 1 || cl > 1e3)
      return setError("Travelers must be a whole number from 1 to 1000.");
    setError("");
    setRunning(true);
    const delay = randomDelay(20);
    const out = await Promise.all([
      runConcurrencyTest({ capacity: cap, clients: cl, strategy: "none", delay }),
      runConcurrencyTest({ capacity: cap, clients: cl, strategy: "optimistic", delay }),
    ]);
    setReports(out);
    setRunning(false);
  }
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BookingHeader />
      <main className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
        <Link className="inline-flex items-center gap-1 text-sm text-primary" to="/admin-dashboard">
          <ArrowLeft aria-hidden="true" className="size-4" /> Admin dashboard
        </Link>
        <h1 className="mt-3 flex items-center gap-3 font-display text-4xl">
          <Activity aria-hidden="true" className="size-8 text-primary" /> Booking concurrency test
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Many travelers try to book the same flight at the same moment. Compare a naive booking
          flow with one that uses optimistic locking (a version check on the seat count) to see
          whether seats get oversold.
        </p>

        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_1fr_auto]">
            <label className="block space-y-2" htmlFor="cap">
              <span className="text-sm font-semibold">Seats available</span>
              <Input
                className="h-11"
                id="cap"
                inputMode="numeric"
                onChange={(e) => setCapacity(e.currentTarget.value)}
                value={capacity}
              />
            </label>
            <label className="block space-y-2" htmlFor="cl">
              <span className="text-sm font-semibold">Travelers booking at once</span>
              <Input
                className="h-11"
                id="cl"
                inputMode="numeric"
                onChange={(e) => setClients(e.currentTarget.value)}
                value={clients}
              />
            </label>
            <Button className="h-11" disabled={running} onClick={() => void run()}>
              <Play aria-hidden="true" /> {running ? "Running\u2026" : "Run test"}
            </Button>
          </div>
          {error && (
            <p className="mt-3 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </section>

        {reports.length > 0 && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {reports.map((r) => {
              const safe = r.overbooked === 0;
              return (
                <section
                  key={r.strategy}
                  className={`rounded-lg border bg-card p-5 shadow-sm ${safe ? "border-primary/40" : "border-destructive/50"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground">
                        {r.strategy === "none" ? "NO LOCKING" : "OPTIMISTIC LOCKING"}
                      </p>
                      <h2 className="mt-1 font-display text-2xl">
                        {r.strategy === "none" ? "Naive booking" : "Version-checked booking"}
                      </h2>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-sm font-semibold ${safe ? "text-primary" : "text-destructive"}`}
                    >
                      {safe ? (
                        <CheckCircle2 aria-hidden="true" className="size-4" />
                      ) : (
                        <XCircle aria-hidden="true" className="size-4" />
                      )}
                      {safe ? "Passed" : "Oversold"}
                    </span>
                  </div>
                  <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                    <Metric
                      label="Confirmed tickets"
                      value={`${r.confirmed} / ${r.capacity} seats`}
                    />
                    <Metric label="Oversold seats" value={String(r.overbooked)} danger={!safe} />
                    <Metric label="Turned away" value={String(r.rejected)} />
                    <Metric label="Retries after conflict" value={String(r.totalRetries)} />
                  </dl>
                  <div className="mt-4 flex flex-wrap gap-1" aria-label="Each traveler's result">
                    {r.attempts.map((a) => (
                      <span
                        key={a.client}
                        title={`Traveler ${a.client}: ${a.ok ? "confirmed" : a.reason}`}
                        className={`size-3 rounded-sm ${a.ok ? "bg-primary" : "bg-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
        <p className="mt-6 text-xs text-muted-foreground">
          Runs in your browser against a simulated seat table. With MySQL, the same rule becomes{" "}
          <code>
            UPDATE flights SET seats = seats - 1, version = version + 1 WHERE id = ? AND version = ?
          </code>
          .
        </p>
      </main>
      <BookingFooter />
    </div>
  );
}
function Metric({ label, value, danger }) {
  return (
    <div className="rounded-md bg-muted p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`mt-1 text-lg font-semibold ${danger ? "text-destructive" : ""}`}>{value}</dd>
    </div>
  );
}
