import { jwtVerify, SignJWT } from "jose";
const key = (secret) => Uint8Array.from(secret, (c) => c.charCodeAt(0));
async function signToken(user, secret) {
  return new SignJWT({ name: user.name, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.email)
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(key(secret));
}
async function verifyToken(token, secret) {
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ["HS256"] });
    const role = payload["role"];
    if (typeof payload.sub !== "string" || (role !== "customer" && role !== "admin")) return null;
    return { email: payload.sub, name: String(payload["name"] ?? ""), role };
  } catch {
    return null;
  }
}
const DEMO_ADMIN = { email: "admin@aerovista.demo", password: "Admin@12345" };
function authenticateDemo(email, password, role, name) {
  if (password.length < 8) return null;
  if (role === "admin") {
    return email.toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password
      ? { email: DEMO_ADMIN.email, name: "AeroVista Admin", role: "admin" }
      : null;
  }
  if (email.toLowerCase() === DEMO_ADMIN.email) return null;
  const fallback = (email.split("@")[0] ?? "Traveler").replace(/[._-]+/g, " ");
  return { email, name: name?.trim() || fallback, role: "customer" };
}
export { DEMO_ADMIN, authenticateDemo, signToken, verifyToken };
