import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { sampleFlights } from "@/lib/airport-data";
import { createDemoBookingReference, passengerSchema } from "@/lib/booking-validation";
import { requireUser } from "@/lib/server-auth";

const body = z.object({
  flightId: z.string().max(40),
  travelDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passengers: z.number().int().min(1).max(9),
  passenger: passengerSchema,
});

export const Route = createFileRoute("/api/public/bookings/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireUser(request, "customer");
        if (auth.response) return auth.response;
        const parsed = body.safeParse(await request.json().catch(() => null));
        if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid booking" }, { status: 400 });
        const flight = sampleFlights.find((f) => f.id === parsed.data.flightId);
        if (!flight) return Response.json({ error: "Flight not found" }, { status: 404 });
        // Demo: nothing is stored on the server until MySQL is reachable.
        return Response.json({
          booking: {
            reference: createDemoBookingReference(),
            flightId: flight.id,
            travelDate: parsed.data.travelDate,
            passengers: parsed.data.passengers,
            total: flight.fare * parsed.data.passengers,
            bookedBy: auth.user.email,
          },
        }, { status: 201 });
      },
    },
  },
});
