import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCompleteToken, completeBookingCore } from "@/lib/complete";

export const dynamic = "force-dynamic";

// A driver taps the "Mark trip complete" link texted to them on
// assignment. The signed token in the link is the authorization — this
// is a private, driver-specific SMS, not a shared channel, so no PIN
// is needed here (unlike the ntfy claim link).

export async function POST(req: NextRequest) {
  try {
    const { tripId, token, paymentMethod, cashAmount } = await req.json();
    if (!tripId || !token || !paymentMethod) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!verifyCompleteToken(tripId, token)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data: booking } = await sb
      .from("bookings")
      .select("id, drivers(name)")
      .eq("trip_id", tripId)
      .single();
    if (!booking) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    const driverName =
      (booking.drivers as unknown as { name?: string } | null)?.name;

    const res = await completeBookingCore({
      bookingId: booking.id,
      paymentMethod,
      cashAmount: cashAmount ? Number(cashAmount) : undefined,
      completedByLabel: driverName ? `${driverName} (driver)` : "Driver",
    });
    if (!res.ok) {
      return NextResponse.json({ error: res.error }, { status: 409 });
    }

    revalidatePath("/admin");
    return NextResponse.json({ ok: true, alreadyCompleted: res.alreadyCompleted ?? false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
