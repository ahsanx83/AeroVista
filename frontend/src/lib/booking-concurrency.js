class SeatInventory {
  seats;
  version = 0;
  bookings = 0;
  constructor(capacity) {
    this.seats = capacity;
  }
  read() {
    return { seats: this.seats, version: this.version };
  }
  /** Blind write: what naive "read, then save" code does. */
  writeUnsafe(seats) {
    this.seats = seats;
    this.version++;
    this.bookings++;
  }
  /** Compare-and-swap: succeeds only if nobody changed the row since it was read. */
  writeIfVersion(expected, seats) {
    if (this.version !== expected) return false;
    this.seats = seats;
    this.version++;
    this.bookings++;
    return true;
  }
}
async function attempt(inv, client, strategy, delay, maxRetries) {
  for (let retries = 0; retries <= maxRetries; retries++) {
    const snap = inv.read();
    if (snap.seats <= 0) return { client, ok: false, retries, reason: "Sold out" };
    await delay();
    if (strategy === "none") {
      inv.writeUnsafe(snap.seats - 1);
      return { client, ok: true, retries };
    }
    if (inv.writeIfVersion(snap.version, snap.seats - 1)) return { client, ok: true, retries };
  }
  return { client, ok: false, retries: maxRetries, reason: "Too many conflicts" };
}
async function runConcurrencyTest(opts) {
  const inv = new SeatInventory(opts.capacity);
  const attempts = await Promise.all(
    Array.from({ length: opts.clients }, (_, i) =>
      attempt(inv, i + 1, opts.strategy, opts.delay, opts.maxRetries ?? 50),
    ),
  );
  const confirmed = attempts.filter((a) => a.ok).length;
  return {
    strategy: opts.strategy,
    capacity: opts.capacity,
    clients: opts.clients,
    confirmed,
    rejected: opts.clients - confirmed,
    seatsLeft: inv.read().seats,
    overbooked: Math.max(0, confirmed - opts.capacity),
    totalRetries: attempts.reduce((s, a) => s + a.retries, 0),
    attempts,
  };
}
const randomDelay = (maxMs) => () => new Promise((r) => setTimeout(r, Math.random() * maxMs));
export { SeatInventory, randomDelay, runConcurrencyTest };
