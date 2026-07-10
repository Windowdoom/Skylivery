import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverHomeToken } from "@/lib/driverTrip";

export const dynamic = "force-dynamic";

// Foreground-only GPS ping. Free, no native app: the browser's own
// Geolocation API reports a position while a driver has /driver/home
// or an active trip page open, authenticated with the same persistent
// home-token used elsewhere for that driver (minted server-side by
// whichever page renders <LocationReporter>, not taken from the URL,
// so this works the same whether the page itself is showing the home
// token or a per-trip token).

export async function POST(req: NextRequest) {
  try {
    const { driverId, token, lat, lng } = await req.json();
    if (!driverId || !token || typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    if (!verifyDriverHomeToken(driverId, token)) {
      return NextResponse.json({ error: "Invalid link" }, { status: 401 });
    }
    if (
      lat < -90 || lat > 90 || lng < -180 || lng > 180 ||
      Number.isNaN(lat) || Number.isNaN(lng)
    ) {
      return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb
      .from("driver_locations")
      .upsert(
        { driver_id: driverId, lat, lng, updated_at: new Date().toISOString() },
        { onConflict: "driver_id" }
      );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
