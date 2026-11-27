import { RoleGate } from "@/components/role-gate";
import { createFileRoute, Link } from "@tanstack/react-router";
import { saveTicket } from "@/lib/saved-tickets";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  CircleAlert,
  Plane,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BookingFooter, BookingHeader } from "@/components/booking-chrome";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { airports, findAirport } from "@/lib/airport-data";
import { apiErrorMessage, createBooking, holdBooking, searchFlights } from "@/lib/api-client";
import {
  createSearchSchema,
  getLocalDateInputValue,
  passengerSchema,
} from "@/lib/booking-validation";
const emptyPassenger = {
  firstName: "",
  lastName: "",
  email: "",
};
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Book a Flight | AeroVista" },
      {
        name: "description",
        content:
          "Search sample air itineraries, compare example fares, and preview an AeroVista booking.",
      },
      { property: "og:title", content: "Book a Flight | AeroVista" },
      {
        property: "og:description",
        content:
          "Search sample air itineraries, compare example fares, and preview an AeroVista booking.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <RoleGate role="customer">
      <Index />
    </RoleGate>
  ),
});
function Index() {
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;
  const signedIn = Boolean(localStorage.getItem("accessToken"));
  const [values, setValues] = useState({
    originCode: "JFK",
    destinationCode: "LHR",
    departureDate: "",
    passengers: "1",
  });
  const [dateMinimum, setDateMinimum] = useState("");
  const [searchIssues, setSearchIssues] = useState([]);
  const [submittedSearch, setSubmittedSearch] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [passenger, setPassenger] = useState(emptyPassenger);
  const [passengerIssues, setPassengerIssues] = useState([]);
  const [previewPassenger, setPreviewPassenger] = useState(null);
  const [bookingRef, setBookingRef] = useState(null);
  const [ticketSaved, setTicketSaved] = useState(false);
  const [holdBookingData, setHoldBookingData] = useState();
  useEffect(() => {
    const now = /* @__PURE__ */ new Date();
    setDateMinimum(getLocalDateInputValue(now));
    now.setDate(now.getDate() + 7);
    setValues((current) => ({ ...current, departureDate: getLocalDateInputValue(now) }));
  }, []);
  const [visibleFlights, setVisibleFlights] = useState([]);
  const [apiError, setApiError] = useState("");
  const [booking, setBooking] = useState(false);
  useEffect(() => {
    const route = submittedSearch ?? {
      originCode: "JFK",
      destinationCode: "LHR",
      departureDate: "",
      passengers: 1,
    };
    let active = true;
    setApiError("");
    searchFlights(route)
      .then((flights) => active && setVisibleFlights(flights))
      .catch((error) => active && (setVisibleFlights([]), setApiError(apiErrorMessage(error))));
    return () => {
      active = false;
    };
  }, [submittedSearch]);
  async function handleConfirm() {
    if (!selectedFlight || !previewPassenger) return;
    setBooking(true);
    setApiError("");
    try {
      const result = await createBooking(holdBookingData?.id);
      setTicketSaved(false);
      setBookingRef(result.reference);
    } catch (error) {
      setApiError(apiErrorMessage(error));
    } finally {
      setBooking(false);
    }
  }
  const origin = findAirport(submittedSearch?.originCode ?? "JFK");
  const destination = findAirport(submittedSearch?.destinationCode ?? "LHR");
  const flightDate = submittedSearch?.departureDate ?? "";
  function updateValue(key, value) {
    setValues((current) => ({ ...current, [key]: value }));
  }
  function handleSearch(event) {
    event.preventDefault();
    const result = createSearchSchema(getLocalDateInputValue(/* @__PURE__ */ new Date())).safeParse(
      values,
    );
    if (!result.success) {
      setSearchIssues(result.error.issues);
      return;
    }
    setSearchIssues([]);
    setSelectedFlight(null);
    setPreviewPassenger(null);
    setPassengerIssues([]);
    setSubmittedSearch(result.data);
  }
  function handleSelectFlight(flight) {
    setSelectedFlight(flight);
    setPreviewPassenger(null);
    setPassengerIssues([]);
  }

  async function handlePassengerSubmit(event) {
    console.log("Hold booking");

    event.preventDefault();
    const result = passengerSchema.safeParse(passenger);
    if (!result.success) {
      console.log(result.error.issues);
      setPassengerIssues(result.error.issues);
      return;
    }

    try {
      const response = await holdBooking({
        flightId: selectedFlight?.id,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        seatPreference: "Window",
        cabinClass: "Economy",
      });

      console.log(JSON.stringify(response, null, 2));

      setHoldBookingData(response);

      setTicketSaved(false);
      //setBookingRef(result.reference);
    } catch (error) {
      setApiError(apiErrorMessage(error));
    } finally {
      setBooking(false);
    }

    setPassengerIssues([]);
    setPreviewPassenger(result.data);
  }
  const destinationIssue = searchIssues.find(
    (issue) => issue.path[0] === "destinationCode",
  )?.message;
  const originIssue = searchIssues.find((issue) => issue.path[0] === "originCode")?.message;
  const dateIssue = searchIssues.find((issue) => issue.path[0] === "departureDate")?.message;
  const passengerCountIssue = searchIssues.find((issue) => issue.path[0] === "passengers")?.message;
  return (
    <div className="min-h-screen bg-background text-foreground">
      <BookingHeader />
      <main className="mx-auto max-w-7xl px-4 pb-4 pt-8 sm:pt-10 md:px-8 md:pt-14">
        <section
          aria-labelledby="page-title"
          className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"
        >
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="size-2 rounded-full bg-coral" />
              AeroVista flight desk
            </p>
            <h1 id="page-title" className="font-display text-4xl leading-tight sm:text-5xl">
              Where would you like to go?
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Compare itineraries from airports around the world, then preview your passenger
              details.
            </p>
          </div>
        </section>

        <section
          aria-labelledby="search-heading"
          className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 id="search-heading" className="font-display text-2xl">
              Search flights
            </h2>
            <p className="text-xs text-muted-foreground">One-way · USD</p>
          </div>
          <form noValidate onSubmit={handleSearch}>
            <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)_minmax(10rem,0.8fr)_minmax(7.5rem,0.55fr)]">
              <AirportField
                id="origin"
                label="From"
                value={values.originCode}
                issue={originIssue}
                onChange={(value) => updateValue("originCode", value)}
              />
              <div className="flex justify-end sm:col-span-2 lg:col-span-1 lg:justify-center">
                <Button
                  aria-label="Swap departure and destination"
                  className="size-10 border border-border"
                  onClick={() =>
                    setValues((current) => ({
                      ...current,
                      originCode: current.destinationCode,
                      destinationCode: current.originCode,
                    }))
                  }
                  size="icon"
                  title="Swap airports"
                  type="button"
                  variant="outline"
                >
                  <ArrowUpDown aria-hidden="true" className="size-4" />
                </Button>
              </div>
              <AirportField
                id="destination"
                label="To"
                value={values.destinationCode}
                issue={destinationIssue}
                onChange={(value) => updateValue("destinationCode", value)}
              />
              <label className="block space-y-2" htmlFor="departure-date">
                <span className="text-sm font-semibold">Departure date</span>
                <Input
                  aria-describedby={dateIssue ? "departure-date-error" : void 0}
                  aria-invalid={Boolean(dateIssue)}
                  className="h-12 bg-background"
                  id="departure-date"
                  min={dateMinimum}
                  onChange={(event) => updateValue("departureDate", event.currentTarget.value)}
                  required
                  type="date"
                  value={values.departureDate}
                />
                {dateIssue && (
                  <span className="block text-xs text-destructive" id="departure-date-error">
                    {dateIssue}
                  </span>
                )}
              </label>
              <label className="block space-y-2" htmlFor="passengers">
                <span className="text-sm font-semibold">Passengers</span>
                <Input
                  aria-describedby={passengerCountIssue ? "passengers-error" : void 0}
                  aria-invalid={Boolean(passengerCountIssue)}
                  className="h-12 bg-background"
                  id="passengers"
                  max={9}
                  min={1}
                  onChange={(event) => updateValue("passengers", event.currentTarget.value)}
                  required
                  type="number"
                  value={values.passengers}
                />
                {passengerCountIssue && (
                  <span className="block text-xs text-destructive" id="passengers-error">
                    {passengerCountIssue}
                  </span>
                )}
              </label>
            </div>
            {searchIssues.length > 0 && (
              <p
                aria-live="polite"
                className="mt-3 flex items-center gap-2 text-sm text-destructive"
                role="alert"
              >
                <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
                Review the highlighted search details.
              </p>
            )}
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center">
              <Button className="h-11 px-5" type="submit">
                <Search aria-hidden="true" />
                Find sample flights
                <ArrowRight aria-hidden="true" />
              </Button>
              <p className="text-xs leading-5 text-muted-foreground">
                Schedules and prices are illustrative, not bookable offers.
              </p>
            </div>
          </form>
        </section>

        <section aria-labelledby="results-heading" className="mt-10 scroll-mt-24">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-sm font-semibold text-primary">
                {submittedSearch ? "Your search" : "Start here"}
              </p>
              <h2 id="results-heading" className="font-display text-3xl">
                {origin?.city ?? "New York"} <span className="text-accent">to</span>{" "}
                {destination?.city ?? "London"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {flightDate ? formatTravelDate(flightDate) : "Example itinerary options"}
                {submittedSearch
                  ? ` \xB7 ${submittedSearch.passengers} passenger${submittedSearch.passengers === 1 ? "" : "s"}`
                  : " \xB7 JFK to LHR sample route"}
              </p>
            </div>
            <p className="text-xs font-medium text-muted-foreground">
              {visibleFlights.length} Flight{visibleFlights.length === 1 ? "" : "s"}
            </p>
          </div>

          {visibleFlights.length > 0 ? (
            <div className="grid gap-3">
              {visibleFlights.map((flight) => (
                <FlightOption
                  key={flight.id}
                  flight={flight}
                  selected={selectedFlight?.id === flight.id}
                  onSelect={() => handleSelectFlight(flight)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-muted/50 px-5 py-8 text-center">
              <p className="font-semibold">No example itinerary for this airport pair yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try the JFK–LHR example route, or choose one of the sample routes listed in the
                airport selector.
              </p>
              <Button
                className="mt-4"
                onClick={() => {
                  setValues((current) => ({
                    ...current,
                    originCode: "JFK",
                    destinationCode: "LHR",
                  }));
                  setSubmittedSearch(null);
                  setSelectedFlight(null);
                }}
                type="button"
                variant="outline"
              >
                Show JFK–LHR examples
              </Button>
            </div>
          )}
        </section>

        {signedIn && selectedFlight && !previewPassenger && (
          <section
            aria-labelledby="passenger-heading"
            className="mt-10 scroll-mt-24 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6"
          >
            <div className="mb-6 flex flex-col justify-between gap-3 border-b border-border pb-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-1 text-sm font-semibold text-primary">Step 2 · Passenger</p>
                <h2 id="passenger-heading" className="font-display text-3xl">
                  Your passenger details
                </h2>
              </div>
              <p className="text-sm text-muted-foreground">
                No payment or personal details are sent or saved.
              </p>
            </div>
            <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <form
                className="grid gap-4 sm:grid-cols-2"
                noValidate
                onSubmit={handlePassengerSubmit}
              >
                <TextField
                  id="first-name"
                  label="First name"
                  value={passenger.firstName}
                  issue={fieldIssue(passengerIssues, "firstName")}
                  autoComplete="given-name"
                  onChange={(value) =>
                    setPassenger((current) => ({ ...current, firstName: value }))
                  }
                />
                <TextField
                  id="last-name"
                  label="Last name"
                  value={passenger.lastName}
                  issue={fieldIssue(passengerIssues, "lastName")}
                  autoComplete="family-name"
                  onChange={(value) => setPassenger((current) => ({ ...current, lastName: value }))}
                />
                <TextField
                  className="sm:col-span-2"
                  id="passenger-email"
                  label="Email address"
                  value={passenger.email}
                  issue={fieldIssue(passengerIssues, "email")}
                  autoComplete="email"
                  type="email"
                  onChange={(value) => setPassenger((current) => ({ ...current, email: value }))}
                />
                {/* <label className="block space-y-2 sm:col-span-2" htmlFor="seat-preference">
                  <span className="text-sm font-semibold">Seat preference</span>
                  <select
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
                    id="seat-preference"
                    onChange={(event) =>
                      setPassenger((current) => ({
                        ...current,
                        seatPreference: event.currentTarget.value,
                      }))
                    }
                    value={passenger.seatPreference}
                  >
                    <option value="any">No preference</option>
                    <option value="window">Window</option>
                    <option value="aisle">Aisle</option>
                  </select>
                </label> */}
                {passengerIssues.length > 0 && (
                  <p
                    aria-live="polite"
                    className="text-sm text-destructive sm:col-span-2"
                    role="alert"
                  >
                    {passengerIssues[0]?.message ?? "Check passenger details."}
                  </p>
                )}
                <div className="flex flex-col gap-3 pt-1 sm:col-span-2 sm:flex-row sm:items-center">
                  <Button className="h-11 px-5" type="submit">
                    Hold Booking <ArrowRight aria-hidden="true" />
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This step does not issue a ticket.
                  </p>
                </div>
              </form>
              <aside
                aria-label="Selected itinerary summary"
                className="border-t border-border pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
              >
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Selected sample
                </p>
                <p className="mt-2 font-semibold">{selectedFlight.airline}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedFlight.flightNumber} · {selectedFlight.duration} · nonstop
                </p>
                <p className="mt-4 text-sm">
                  {origin?.code} → {destination?.code}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {flightDate ? formatTravelDate(flightDate) : "Sample date"}
                </p>
                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Example total</span>
                  <span className="font-display text-2xl">
                    {money.format(selectedFlight.price * (submittedSearch?.passengers ?? 1))}
                  </span>
                </div>
                <p className="mt-1 text-right text-xs text-muted-foreground">
                  estimated total · USD
                </p>
              </aside>
            </div>
          </section>
        )}

        {signedIn && selectedFlight && previewPassenger && !bookingRef && (
          <section
            aria-labelledby="preview-heading"
            className="mt-10 rounded-lg border border-primary/30 bg-secondary p-5 sm:p-7"
          >
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-primary">Step 3 · Review</p>
                  <h2 id="preview-heading" className="mt-1 font-display text-3xl">
                    Itinerary preview
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    Your details passed the form checks. No ticket has been booked, and nothing has
                    been sent or saved.
                  </p>
                </div>
              </div>
              <Badge
                className="w-fit border border-primary/20 bg-background text-primary shadow-none"
                variant="outline"
              >
                Not a ticket
              </Badge>
            </div>
            <div className="mt-6 grid gap-4 border-t border-primary/15 pt-5 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">Traveler</p>
                <p className="mt-1 font-semibold">
                  {previewPassenger.firstName} {previewPassenger.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Route and date</p>
                <p className="mt-1 font-semibold">
                  {origin?.code} → {destination?.code} ·{" "}
                  {flightDate ? formatTravelDate(flightDate) : "Sample date"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Example total</p>
                <p className="mt-1 font-semibold">
                  {money.format(selectedFlight.price * (submittedSearch?.passengers ?? 1))} USD
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  setSelectedFlight(null);
                  setPreviewPassenger(null);
                  setPassenger(emptyPassenger);
                }}
                type="button"
                variant="outline"
              >
                Choose another flight
              </Button>
              {apiError && (
                <p className="text-sm text-destructive" role="alert">
                  {apiError}
                </p>
              )}
              <Button disabled={booking} onClick={() => void handleConfirm()} type="button">
                <Check aria-hidden="true" /> Confirm reservation
              </Button>
            </div>
          </section>
        )}

        {signedIn && selectedFlight && previewPassenger && bookingRef && (
          <section
            aria-labelledby="complete-heading"
            className="mt-10 overflow-hidden rounded-lg border border-primary/30 bg-card shadow-sm"
          >
            <div className="flex flex-col gap-4 bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-foreground text-primary">
                  <Check aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold opacity-80">Step 4 · Complete</p>
                  <h2 id="complete-heading" className="mt-1 font-display text-3xl">
                    Reservation confirmed
                  </h2>
                  <p className="mt-1 text-sm opacity-80">
                    A demo e-ticket for {previewPassenger.email}
                  </p>
                </div>
              </div>
              <div className="sm:text-right">
                <p className="text-xs opacity-80">Booking reference</p>
                <p className="font-mono text-2xl font-bold tracking-widest">{bookingRef}</p>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-7">
              <div>
                <p className="font-display text-4xl">{origin?.code}</p>
                <p className="text-sm text-muted-foreground">{origin?.city}</p>
                <p className="mt-1 font-semibold">{selectedFlight.departureTime}</p>
              </div>
              <div className="flex flex-col items-center text-xs text-muted-foreground">
                <Plane aria-hidden="true" className="size-5 text-primary" />
                {selectedFlight.duration}
              </div>
              <div className="sm:text-right">
                <p className="font-display text-4xl">{destination?.code}</p>
                <p className="text-sm text-muted-foreground">{destination?.city}</p>
                <p className="mt-1 font-semibold">
                  {selectedFlight.arrivalTime}
                  {selectedFlight.arrivalDayOffset > 0
                    ? ` +${selectedFlight.arrivalDayOffset}`
                    : ""}
                </p>
              </div>
            </div>
            <div className="grid gap-4 border-t border-dashed border-border p-5 sm:grid-cols-4 sm:p-7">
              <div>
                <p className="text-xs text-muted-foreground">Passenger</p>
                <p className="mt-1 font-semibold">
                  {previewPassenger.firstName} {previewPassenger.lastName}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Flight</p>
                <p className="mt-1 font-semibold">
                  {selectedFlight.airline} {selectedFlight.flightNumber}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Date · Seat</p>
                <p className="mt-1 font-semibold">
                  {flightDate ? formatTravelDate(flightDate) : "Sample date"} ·{" "}
                  {previewPassenger.seatPreference}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total paid (example)</p>
                <p className="mt-1 font-semibold">
                  {money.format(selectedFlight.fare * (submittedSearch?.passengers ?? 1))} USD
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 border-t border-border p-5 sm:px-7">
              {/*<Button
                disabled={ticketSaved}
                onClick={() => {
                  saveTicket({
                    reference: bookingRef,
                    savedAt: new Date().toISOString(),
                    passengerName: `${previewPassenger.firstName} ${previewPassenger.lastName}`,
                    email: previewPassenger.email,
                    seatPreference: previewPassenger.seatPreference,
                    airline: selectedFlight.airline,
                    flightNumber: selectedFlight.flightNumber,
                    originCode: origin?.code ?? selectedFlight.originCode,
                    originCity: origin?.city ?? "",
                    destinationCode: destination?.code ?? selectedFlight.destinationCode,
                    destinationCity: destination?.city ?? "",
                    departureTime: selectedFlight.departureTime,
                    arrivalTime: selectedFlight.arrivalTime,
                    arrivalDayOffset: selectedFlight.arrivalDayOffset,
                    duration: selectedFlight.duration,
                    travelDate: flightDate ? formatTravelDate(flightDate) : "Sample date",
                    passengers: submittedSearch?.passengers ?? 1,
                    total: selectedFlight.fare * (submittedSearch?.passengers ?? 1),
                  });
                  setTicketSaved(true);
                }}
                type="button"
                variant="outline"
              >
                {ticketSaved ? "Saved in this browser" : "Save ticket"}
              </Button>*/}
              {ticketSaved && (
                <Button asChild type="button" variant="ghost">
                  <Link to="/tickets">View saved tickets</Link>
                </Button>
              )}
              <Button onClick={() => window.print()} type="button" variant="outline">
                Print ticket
              </Button>
              <Button
                onClick={() => {
                  setBookingRef(null);
                  setSelectedFlight(null);
                  setPreviewPassenger(null);
                  setPassenger(emptyPassenger);
                }}
                type="button"
              >
                Book another flight
              </Button>
              {/* <p className="text-xs text-muted-foreground">
                Demo only — not saved until a MySQL database is connected.
              </p> */}
            </div>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-5 text-xs leading-5 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2">
            <Plane aria-hidden="true" className="size-4 text-primary" /> Sample schedules and fares
            are not live availability.
          </p>
          <p>Airport locations: OurAirports open data.</p>
        </div>
      </main>
      <BookingFooter />
    </div>
  );
}
function AirportField({ id, label, value, issue, onChange }) {
  return (
    <label className="block space-y-2" htmlFor={`${id}-airport`}>
      <span className="text-sm font-semibold">{label}</span>
      <span className="relative block">
        <select
          aria-describedby={issue ? `${id}-airport-error` : void 0}
          aria-invalid={Boolean(issue)}
          className="h-12 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-10 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
          id={`${id}-airport`}
          onChange={(event) => onChange(event.currentTarget.value)}
          value={value}
        >
          {airports.map((airport) => (
            <option key={airport.code} value={airport.code}>
              {airport.city} · {airport.code}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
      </span>
      {issue && (
        <span className="block text-xs text-destructive" id={`${id}-airport-error`}>
          {issue}
        </span>
      )}
    </label>
  );
}
function TextField({ id, label, value, issue, onChange, className, type = "text", autoComplete }) {
  return (
    <label className={`block space-y-2 ${className ?? ""}`} htmlFor={id}>
      <span className="text-sm font-semibold">{label}</span>
      <Input
        aria-describedby={issue ? `${id}-error` : void 0}
        aria-invalid={Boolean(issue)}
        autoComplete={autoComplete}
        className="h-11 bg-background"
        id={id}
        maxLength={type === "email" ? 254 : 70}
        onChange={(event) => onChange(event.currentTarget.value)}
        type={type}
        value={value}
      />
      {issue && (
        <span className="block text-xs text-destructive" id={`${id}-error`}>
          {issue}
        </span>
      )}
    </label>
  );
}
function FlightOption({ flight, selected, onSelect }) {
  const origin = findAirport(flight.originCode);
  const destination = findAirport(flight.destinationCode);
  if (!origin || !destination) return null;
  return (
    <article
      className={`grid gap-4 rounded-lg border bg-card p-4 shadow-sm transition-colors sm:p-5 lg:grid-cols-[minmax(10rem,1fr)_minmax(15rem,1.7fr)_minmax(10rem,0.65fr)] lg:items-center ${selected ? "border-primary ring-1 ring-primary/30" : "border-border"}`}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
          <Plane aria-hidden="true" className="size-[18px]" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{flight.airline}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{flight.flightNumber} · Economy</p>
        </div>
      </div>

      <div className="grid grid-cols-[minmax(4.5rem,1fr)_minmax(5rem,1.4fr)_minmax(4.5rem,1fr)] items-center gap-2">
        <div>
          <p className="font-display text-2xl">{flight.departureTime}</p>
          <p className="truncate text-xs text-muted-foreground">
            {origin.code} · {origin.city}
          </p>
        </div>
        <div className="px-1 text-center">
          <p className="mb-1 text-[11px] text-muted-foreground">{flight.duration}</p>
          <svg aria-hidden="true" className="h-5 w-full text-primary" viewBox="0 0 160 20">
            <path
              d="M 7 10 C 45 2, 112 18, 153 10"
              fill="none"
              stroke="currentColor"
              strokeDasharray="2 5"
              strokeLinecap="round"
              strokeWidth="1.5"
            />
            <circle className="fill-primary" cx="7" cy="10" r="3" />
            <circle className="fill-coral" cx="153" cy="10" r="3" />
            <path
              d="M78 4l2 5 7 2-7 2-2 4-1-.5.5-3.2-5-2.3 5-2.2-.5-3.2z"
              className="fill-foreground"
            />
          </svg>
          <p className="mt-1 text-[11px] text-muted-foreground">Nonstop · sample</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl">
            {flight.arrivalTime}
            {flight.arrivalDayOffset ? (
              <sup className="ml-0.5 font-sans text-[10px] text-muted-foreground">
                +{flight.arrivalDayOffset}
              </sup>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {destination.code} · {destination.city}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-3 sm:pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
        <div>
          <p className="font-display text-2xl">{money.format(flight.price)}</p>
          <p className="text-xs text-muted-foreground">price / person</p>
        </div>
        <Button
          aria-pressed={selected}
          className="min-w-24"
          onClick={onSelect}
          type="button"
          variant={selected ? "secondary" : "outline"}
        >
          {selected ? (
            <>
              <Check aria-hidden="true" /> Selected
            </>
          ) : (
            <>
              Select <ArrowRight aria-hidden="true" />
            </>
          )}
        </Button>
      </div>
    </article>
  );
}
function formatTravelDate(value) {
  return new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(
    /* @__PURE__ */ new Date(`${value}T12:00:00`),
  );
}
function fieldIssue(issues, field) {
  return issues.find((issue) => issue.path[0] === field)?.message;
}
