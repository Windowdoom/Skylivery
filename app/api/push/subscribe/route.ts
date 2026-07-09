import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverPin } from "@/lib/driverPin";
import { driverHistoryUrl, driverHomeUrl } from "@/lib/driverTrip";

export const dynamic = "force-dynamic";

// One-time binding of a driver's phone/browser to their identity,
// verified the same way the ntfy claim page is (last 4 digits of the
// phone on file) since this is also a shared-URL setup page, not a
// private per-driver link like the SMS/push-claim flows are. A wrong
// PIN here is locked out after repeated failures (see lib/driverPin.ts)
// since a successful guess would persistently register the attacker's
// device to receive that driver's future trip offers, not just steal
// one action.

export async function POST(req: NextRequest) {
  try {
    const { driverId, pin, subscription } = await req.json();
    if (!driverId || !pin || !subscription?.endpoint || !subscription?.keys) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const pinCheck = await verifyDriverPin(driverId, pin);
    if (!pinCheck.ok) {
      return NextResponse.json({ error: pinCheck.error }, { status: 401 });
    }

    const sb = supabaseAdmin();
    const { error } = await sb
      .from("driver_push_subscriptions")
      .upsert(
        {
          driver_id: driverId,
          endpoint: subscription.endpoint,
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        { onConflict: "endpoint" }
      );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      historyUrl: driverHistoryUrl(driverId),
      homeUrl: driverHomeUrl(driverId),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
