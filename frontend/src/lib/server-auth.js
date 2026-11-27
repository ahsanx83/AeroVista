// Server-only helpers shared by API routes: read the JWT secret and verify the caller's role.
import { verifyToken } from "@/lib/jwt";

export function jwtSecret() {
  return process.env["JWT_SECRET"] ?? null;
}

/** Returns { user } on success or { response } with the error to send back. */
export async function requireUser(request, role) {
  const secret = jwtSecret();
  if (!secret) return { response: Response.json({ error: "Server not configured" }, { status: 500 }) };
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const user = token ? await verifyToken(token, secret) : null;
  if (!user) return { response: Response.json({ error: "Please sign in again" }, { status: 401 }) };
  if (role && user.role !== role) return { response: Response.json({ error: `Only ${role} accounts can do this` }, { status: 403 }) };
  return { user };
}
