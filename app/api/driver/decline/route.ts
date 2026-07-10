import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverTripToken } from "@/lib/driverTrip";
import { ntfyPush } from "@/lib/ntfy";

export const dynamic = "force-dynamic";

// Explicit "pass" on a push-offered trip. Doesn't change the booking
// (it's still pending for every other driver who was offered it) —
// this just gives a driver a clean way to say "not me" instead of
// leaving dispatch to wonder why they never claimed it, and lets
// dispatch know right away if it's worth a manual call instead of
// waiting on the rest of the offer window.

export async function POST(req: NextRequest) {
  try {
    const { tripId, driverId, token } = await req.json();
    if (!tripId || !driverId || !token) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!verifyDriverTripToken(tripId, driverId, token)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { data: driver } = await sb.from("drivers").select("name").eq("id", driverId).single();

    await ntfyPush({
      title: `Driver passed · ${tripId}`,
      body: `${driver?.name ?? "A driver"} passed on ${tripId}. Still open for other drivers.`,
      tags: "no_entry_sign",
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
