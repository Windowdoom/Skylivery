import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverTripToken } from "@/lib/driverTrip";
import { assignDriverToBooking } from "@/lib/assign";

export const dynamic = "force-dynamic";

// Claim endpoint for the web-push driver flow. The signed token proves
// this link only ever reached one specific driver's own device (push
// subscriptions are per-device, not a shared channel like ntfy), so no
// PIN step is needed here — unlike /api/claim.

export async function POST(req: NextRequest) {
  try {
    const { tripId, driverId, token, vehicleId } = await req.json();
    if (!tripId || !driverId || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!verifyDriverTripToken(tripId, driverId, token)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data: booking } = await sb
      .from("bookings")
      .select("id, status, drivers(name)")
      .eq("trip_id", tripId)
      .single();
    if (!booking) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (booking.status !== "pending") {
      const takenBy = (booking.drivers as unknown as { name?: string } | null)?.name;
      return NextResponse.json(
        {
          error:
            booking.status === "assigned"
              ? `Already claimed${takenBy ? ` by ${takenBy}` : ""}.`
              : `Trip is ${booking.status}.`,
        },
        { status: 409 }
      );
    }

    const { data: driver } = await sb
      .from("drivers")
      .select("id, name, primary_vehicle, active")
      .eq("id", driverId)
      .eq("active", true)
      .single();
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const res = await assignDriverToBooking({
      bookingId: booking.id,
      driverId: driver.id,
      vehicleId: vehicleId || driver.primary_vehicle || null,
      byLabel: `${driver.name} (push claim)`,
      requirePending: true,
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error === "already taken" ? "Already claimed by someone else." : res.error },
        { status: res.error === "already taken" ? 409 : 500 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
