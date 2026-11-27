import { describe, expect, it } from "vitest";
import { authenticateDemo, signToken, verifyToken } from "./jwt";
const secret = "test-secret-test-secret-test-secret-1234";
describe("jwt auth", () => {
  it("round-trips role in token", async () => {
    const t = await signToken({ email: "a@b.com", name: "A", role: "admin" }, secret);
    expect((await verifyToken(t, secret))?.role).toBe("admin");
  });
  it("rejects token signed with another key", async () => {
    const t = await signToken({ email: "a@b.com", name: "A", role: "customer" }, secret);
    expect(await verifyToken(t, "other-secret-other-secret-other-1234")).toBeNull();
  });
  it("only demo admin credentials get admin role", () => {
    expect(authenticateDemo("x@y.com", "password123", "admin")).toBeNull();
    expect(authenticateDemo("admin@aerovista.demo", "Admin@12345", "admin")?.role).toBe("admin");
    expect(authenticateDemo("x@y.com", "password123", "customer")?.role).toBe("customer");
  });
});
