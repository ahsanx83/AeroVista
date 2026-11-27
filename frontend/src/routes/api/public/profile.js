import { createFileRoute } from "@tanstack/react-router";
import { profileUpdateSchema } from "@/lib/booking-validation";
import { requireUser } from "@/lib/server-auth";

export const Route = createFileRoute("/api/public/profile")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireUser(request, "customer");
        if (auth.response) return auth.response;
        return Response.json({ profile: { fullName: auth.user.name, email: auth.user.email } }, { headers: { "Cache-Control": "no-store" } });
      },
      PUT: async ({ request }) => {
        const auth = await requireUser(request, "customer");
        if (auth.response) return auth.response;
        const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid profile" }, { status: 400 });
        return Response.json({ profile: parsed.data });
      },
    },
  },
});
