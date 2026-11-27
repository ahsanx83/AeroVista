import { describe, expect, it } from "vitest";
import { nameFromEmail } from "./demo-account";
import { profileUpdateSchema } from "./booking-validation";
const base = {
  fullName: "Ana Lee",
  email: "ana@x.co",
  preferredCabin: "economy",
  homeAirport: "JFK",
};
describe("demo account", () => {
  it("derives a display name from the email", () => {
    expect(nameFromEmail("ana.lee@x.co")).toBe("Ana Lee");
  });
  it("rejects a malformed phone number", () => {
    expect(profileUpdateSchema.safeParse({ ...base, phone: "abc" }).success).toBe(false);
  });
  it("allows an empty phone number", () => {
    expect(profileUpdateSchema.safeParse({ ...base, phone: "" }).success).toBe(true);
  });
});
