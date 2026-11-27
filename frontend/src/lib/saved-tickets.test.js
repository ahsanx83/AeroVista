import { describe, expect, it } from "vitest";
import { parseSavedTickets, upsertTicket } from "./saved-tickets";
const t = (reference) => ({
  reference,
  savedAt: "",
  passengerName: "A B",
  email: "a@b.co",
  seatPreference: "any",
  airline: "X",
  flightNumber: "X1",
  originCode: "JFK",
  originCity: "NY",
  destinationCode: "LHR",
  destinationCity: "London",
  departureTime: "1",
  arrivalTime: "2",
  arrivalDayOffset: 0,
  duration: "7h",
  travelDate: "",
  passengers: 1,
  total: 100,
});
describe("saved tickets", () => {
  it("saving the same reference twice keeps one copy", () => {
    expect(upsertTicket([t("AAA"), t("BBB")], t("BBB")).map((x) => x.reference)).toEqual([
      "BBB",
      "AAA",
    ]);
  });
  it("corrupt storage yields an empty list", () => {
    expect(parseSavedTickets("{oops")).toEqual([]);
  });
});
