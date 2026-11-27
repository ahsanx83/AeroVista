import { createFileRoute } from "@tanstack/react-router";
import { verifyToken } from "@/lib/jwt";
export const Route = createFileRoute("/api/public/auth/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env["JWT_SECRET"];
        if (!secret) return Response.json({ error: "Server not configured" }, { status: 500 });
        const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
        const user = token ? await verifyToken(token, secret) : null;
        if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
        return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
      },
    },
  },
});
