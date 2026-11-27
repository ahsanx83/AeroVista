import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authenticateDemo, signToken } from "@/lib/jwt";
const body = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  role: z.enum(["customer", "admin"]),
  name: z.string().max(100).optional(),
});
export const Route = createFileRoute("/api/public/auth/login")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["JWT_SECRET"];
        if (!secret) return Response.json({ error: "Server not configured" }, { status: 500 });
        const parsed = body.safeParse(await request.json().catch(() => null));
        if (!parsed.success)
          return Response.json({ error: "Invalid email or password format" }, { status: 400 });
        const { email, password, role, name } = parsed.data;
        const user = authenticateDemo(email, password, role, name);
        if (!user) return Response.json({ error: "Wrong email or password" }, { status: 401 });
        return Response.json({ token: await signToken(user, secret), user });
      },
    },
  },
});
