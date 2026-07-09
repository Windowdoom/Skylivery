import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyClaimToken, assignDriverToBooking } from "@/lib/assign";

export const dynamic = "force-dynamic";

// A driver taps "Claim trip" in the new-booking ntfy push, picks their
// name on the claim page, and this endpoint assigns them. The signed
// token in the link is the authorization — no dispatcher login needed.

export async function POST(req: NextRequest) {
  try {
    const { tripId, token, driverId, vehicleId } = await req.json();
    if (!tripId || !token || !driverId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!verifyClaimToken(tripId, token)) {
      return NextResponse.json({ error: "Invalid claim link" }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data: booking } = await sb
      .from("bookings")
      .select("id, status, assigned_driver, drivers(name)")
      .eq("trip_id", tripId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }
    if (booking.status !== "pending") {
      const takenBy =
        (booking.drivers as unknown as { name?: string } | null)?.name;
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
      .select("id, name, active")
      .eq("id", driverId)
      .eq("active", true)
      .single();
    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    const res = await assignDriverToBooking({
      bookingId: booking.id,
      driverId: driver.id,
      vehicleId: vehicleId || null,
      byLabel: `${driver.name} (self-claim)`,
      requirePending: true,
    });
    if (!res.ok) {
      return NextResponse.json(
        { error: res.error === "already taken" ? "Already claimed by someone else." : res.error },
        { status: res.error === "already taken" ? 409 : 500 }
      );
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true, driverName: driver.name });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
