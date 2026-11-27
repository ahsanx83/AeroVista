import { describe, expect, it } from "vitest";
import { runConcurrencyTest } from "./booking-concurrency";
const tick = () => new Promise((r) => setTimeout(r, 0));
describe("booking concurrency", () => {
  it("without locking, 50 buyers for 10 seats overbook the flight", async () => {
    const r = await runConcurrencyTest({
      capacity: 10,
      clients: 50,
      strategy: "none",
      delay: tick,
    });
    expect(r.overbooked).toBeGreaterThan(0);
  });
  it("with optimistic locking, 50 buyers for 10 seats confirm exactly 10", async () => {
    const r = await runConcurrencyTest({
      capacity: 10,
      clients: 50,
      strategy: "optimistic",
      delay: tick,
    });
    expect(r.confirmed).toBe(10);
    expect(r.seatsLeft).toBe(0);
  });
});
