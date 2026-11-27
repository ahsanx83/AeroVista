import { createFileRoute } from "@tanstack/react-router";
import { findSampleFlights } from "@/lib/airport-data";
import { requireUser } from "@/lib/server-auth";

export const Route = createFileRoute("/api/public/flights/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await requireUser(request, "customer");
        if (auth.response) return auth.response;
        const url = new URL(request.url);
        const origin = (url.searchParams.get("origin") ?? "").toUpperCase();
        const destination = (url.searchParams.get("destination") ?? "").toUpperCase();
        if (!/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) {
          return Response.json({ error: "Choose valid airports" }, { status: 400 });
        }
        return Response.json({ flights: findSampleFlights(origin, destination) });
      },
    },
  },
});
