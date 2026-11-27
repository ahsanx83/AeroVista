import { describe, expect, it } from "vitest";
import { createSearchSchema, passengerSchema, profileSignupSchema } from "@/lib/booking-validation";
const searchSchema = createSearchSchema("2026-12-01");
const validSearch = {
  originCode: "JFK",
  destinationCode: "LHR",
  departureDate: "2026-12-15",
  passengers: "1",
};
describe("AeroVista booking validation", () => {
  it("accepts a future JFK-to-LHR flight search", () => {
    expect(searchSchema.safeParse(validSearch).success).toBe(true);
  });
  it("requires different airports", () => {
    const result = searchSchema.safeParse({ ...validSearch, destinationCode: "JFK" });
    expect(result.success).toBe(false);
  });
  it("accepts 1 through 9 passengers and rejects 0 or 10", () => {
    expect(searchSchema.safeParse({ ...validSearch, passengers: "1" }).success).toBe(true);
    expect(searchSchema.safeParse({ ...validSearch, passengers: "9" }).success).toBe(true);
    expect(searchSchema.safeParse({ ...validSearch, passengers: "0" }).success).toBe(false);
    expect(searchSchema.safeParse({ ...validSearch, passengers: "10" }).success).toBe(false);
  });
  it("rejects a date earlier than the current search date", () => {
    expect(searchSchema.safeParse({ ...validSearch, departureDate: "2026-11-30" }).success).toBe(
      false,
    );
  });
  it("validates passenger contact details", () => {
    expect(
      passengerSchema.safeParse({
        firstName: "  Alex ",
        lastName: "Rivera",
        email: "alex@example.com",
        seatPreference: "window",
      }).success,
    ).toBe(true);
    expect(
      passengerSchema.safeParse({
        firstName: "Alex",
        lastName: "Rivera",
        email: "not-an-email",
        seatPreference: "window",
      }).success,
    ).toBe(false);
  });
  it("requires profile details when creating a customer account", () => {
    expect(
      profileSignupSchema.safeParse({
        fullName: "Alex Rivera",
        email: "alex@example.com",
        password: "flightpass8",
        preferredCabin: "economy",
        homeAirport: "JFK",
      }).success,
    ).toBe(true);
    expect(
      profileSignupSchema.safeParse({
        fullName: "",
        email: "alex@example.com",
        password: "flightpass8",
        preferredCabin: "economy",
        homeAirport: "JFK",
      }).success,
    ).toBe(false);
  });
});
