import { createFileRoute } from "@tanstack/react-router";
import { profileSignupSchema } from "@/lib/booking-validation";
import { authenticateDemo, signToken } from "@/lib/jwt";
import { jwtSecret } from "@/lib/server-auth";

export const Route = createFileRoute("/api/public/auth/register")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = jwtSecret();
        if (!secret) return Response.json({ error: "Server not configured" }, { status: 500 });
        const parsed = profileSignupSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid details" }, { status: 400 });
        const { fullName, email, password, preferredCabin, homeAirport } = parsed.data;
        const user = authenticateDemo(email, password, "customer", fullName);
        if (!user) return Response.json({ error: "This email can't be used for a customer account" }, { status: 409 });
        const profile = { fullName, email, phone: "", preferredCabin, homeAirport, memberSince: new Date().toISOString() };
        return Response.json({ token: await signToken(user, secret), user, profile }, { status: 201 });
      },
    },
  },
});
