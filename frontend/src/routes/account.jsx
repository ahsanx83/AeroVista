import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CircleAlert, LogOut, Plane, Ticket, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { airports, findAirport } from "@/lib/airport-data";
import { profileUpdateSchema } from "@/lib/booking-validation";
import { loadDemoProfile, saveDemoProfile, signOutDemo } from "@/lib/demo-account";
import { apiErrorMessage, updateProfile, myBooking, cancelBooking } from "@/lib/api-client";
import { loadSavedTickets } from "@/lib/saved-tickets";
import { Label } from "@radix-ui/react-context-menu";
import { toast, ToastContainer } from "react-toastify";
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const cabins = {
  economy: "Economy",
  premium: "Premium economy",
  business: "Business",
  first: "First",
};
const selectClass =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const Route = createFileRoute("/account")({
  head: () => ({
    meta: [
      { title: "My Account | AeroVista" },
      {
        name: "description",
        content: "Your AeroVista traveler profile, preferences and saved demo tickets.",
      },
      { property: "og:title", content: "My Account | AeroVista" },
      {
        property: "og:description",
        content: "Your AeroVista traveler profile, preferences and saved demo tickets.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AccountPage,
});

function AccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [draft, setDraft] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [saved, setSaved] = useState(false);

  async function getBookingData() {
    const response = await myBooking();

    setTickets(response);
  }
  useEffect(() => {
    if (localStorage.getItem("user")) setProfile(JSON.parse(localStorage.getItem("user")));

    getBookingData();
  }, []);

  // function update(key, value) {
  //   setSaved(false);
  //   setDraft((d) => (d ? { ...d, [key]: value } : d));
  // }
  const [saveError, setSaveError] = useState("");
  async function handleSave(event) {}
  // async function handleSave(event) {
  //   event.preventDefault();
  //   if (!draft) return;
  //   const result = profileUpdateSchema.safeParse(draft);
  //   if (!result.success) {
  //     setIssues(result.error.issues);
  //     return;
  //   }
  //   setIssues([]);
  //   setSaveError("");
  //   try {
  //     const fromApi = await updateProfile(result.data);
  //     const next = { ...draft, ...fromApi };
  //     saveDemoProfile(next);
  //     setProfile(next);
  //     setSaved(true);
  //   } catch (error) {
  //     setSaveError(apiErrorMessage(error));
  //   }
  // }

  async function handleCancel(flight) {
    try {
      const result = await cancelBooking(flight?.id);
      toast.success("Ticket cancelled successfully");
      await getBookingData();
    } catch (error) {
      toast.error(error);
    }
  }

  const issue = (f) => issues.find((i) => i.path[0] === f)?.message;

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
        text="xs"
      />
      <div className="min-h-screen bg-background text-foreground">
        <BookingHeader />
        <main className="mx-auto max-w-6xl px-4 pt-10 md:px-8">
          {profile == null ? (
            <div className="mx-auto max-w-md rounded-lg border border-dashed border-border p-10 text-center">
              <UserRound aria-hidden="true" className="mx-auto size-8 text-primary" />
              <h1 className="mt-3 font-display text-3xl">You're signed out</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to see your traveler profile.
              </p>
              <Button asChild className="mt-5">
                <Link to="/sign-in">Customer Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <section className="flex flex-col gap-5 rounded-lg bg-primary p-6 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-8">
                <div className="flex items-center gap-4">
                  <span className="grid size-14 place-items-center rounded-full bg-primary-foreground font-display text-2xl text-primary">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="text-sm opacity-80">Welcome back</p>
                    <h1 className="font-display text-3xl sm:text-4xl">{profile.fullName}</h1>
                    <p className="text-sm opacity-80">
                      {profile.email} · Member since{" "}
                      {new Date(profile.memberSince).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {/* <Button
                onClick={() => {
                  signOutDemo();
                  void navigate({ to: "/sign-in" });
                }}
                variant="secondary"
              >
                <LogOut aria-hidden="true" /> Sign out
              </Button> */}
              </section>

              {/* <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <CircleAlert aria-hidden="true" className="size-4 text-accent-foreground" /> Demo
              account: kept only in this browser until a MySQL database is connected.
            </p> */}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Stat label="Saved tickets" value={String(tickets.length)} />
                <Stat
                  label="Home airport"
                  value={`${findAirport(profile.homeAirport)?.city ?? ""} \xB7 ${profile.homeAirport}`}
                />
                <Stat label="Preferred cabin" value={cabins[profile.preferredCabin]} />
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
                <section
                  aria-labelledby="profile-heading"
                  className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7"
                >
                  <h2 id="profile-heading" className="font-display text-2xl">
                    Profile details
                  </h2>
                  <form className="mt-5 grid gap-4" noValidate onSubmit={handleSave}>
                    <Field
                      id="acc-name"
                      label="Full name"
                      value={profile.fullName}
                      issue={issue("fullName")}
                      onChange={(v) => update("fullName", v)}
                      disabled={true}
                    />
                    <Field
                      id="acc-email"
                      label="Email"
                      type="email"
                      value={profile.email}
                      issue={issue("email")}
                      onChange={(v) => update("email", v)}
                    />
                    {/* <Field
                    id="acc-phone"
                    label="Phone (optional)"
                    type="tel"
                    value={draft.phone}
                    issue={issue("phone")}
                    onChange={(v) => update("phone", v)}
                  /> */}
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="block space-y-2" htmlFor="acc-cabin">
                        <span className="text-sm font-semibold">Preferred cabin</span>
                        <select
                          className={selectClass}
                          id="acc-cabin"
                          value={profile.preferredCabin}
                          onChange={(e) => update("preferredCabin", e.currentTarget.value)}
                        >
                          {Object.entries(cabins).map(([v, l]) => (
                            <option key={v} value={v}>
                              {l}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-2" htmlFor="acc-home">
                        <span className="text-sm font-semibold">Home airport</span>
                        <select
                          className={selectClass}
                          id="acc-home"
                          value={profile.homeAirport}
                          onChange={(e) => update("homeAirport", e.currentTarget.value)}
                        >
                          {airports.map((a) => (
                            <option key={a.code} value={a.code}>
                              {a.city} · {a.code}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {/* <div className="flex items-center gap-3">
                    <Button type="submit">Save changes</Button>
                    {saveError && (
                      <span className="text-sm text-destructive" role="alert">
                        {saveError}
                      </span>
                    )}
                    {saved && (
                      <span className="text-sm text-primary" role="status">
                        Profile updated.
                      </span>
                    )}
                  </div> */}
                  </form>
                </section>

                <section
                  aria-labelledby="trips-heading"
                  className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h2 id="trips-heading" className="font-display text-2xl">
                      My trips
                    </h2>
                    <Button asChild size="sm" variant="outline">
                      <Link to="/tickets">
                        <Ticket aria-hidden="true" /> All tickets
                      </Link>
                    </Button>
                  </div>
                  {tickets.length === 0 ? (
                    <div className="mt-5 rounded-md border border-dashed border-border p-8 text-center">
                      <p className="text-sm text-muted-foreground">No saved tickets yet.</p>
                      <Button asChild className="mt-4" size="sm">
                        <Link to="/">Book a flight</Link>
                      </Button>
                    </div>
                  ) : (
                    <ul className="mt-5 divide-y divide-border">
                      {tickets.slice(0, 5).map((t) => (
                        <li
                          key={t.reference}
                          className="flex items-center justify-between gap-3 py-3 border-2 px-3 rounded-lg mt-2"
                        >
                          <div className="flex items-center gap-3">
                            <Plane aria-hidden="true" className="size-4 text-primary" />
                            <div>
                              <p className="font-semibold">
                                {t.originCode} → {t.destinationCode}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t.airlineName}, {t.flightNumber}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(t.departureTime).toLocaleString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-sm font-bold">{t.reference}</p>
                            <p className="text-xs text-muted-foreground">
                              {money.format(t.totalPaid)}
                            </p>
                          </div>
                          {/* <Button
                            className="bg-red-400 hover:bg-red-600 text-white"
                            onClick={() => handleCancel(t)}
                          >
                            Cancel
                          </Button> */}
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
    </>
  );
}
function Stat({ label, value }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
function Field({ id, label, value, issue, type = "text", onChange }) {
  return (
    <label className="block space-y-2" htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <Input
        aria-invalid={Boolean(issue)}
        className="h-11 bg-background"
        id={id}
        onChange={(e) => onChange(e.currentTarget.value)}
        type={type}
        value={value}
      />
      {issue && <span className="block text-xs text-destructive">{issue}</span>}
    </label>
  );
}
