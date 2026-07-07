import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { sendBookingConfirmation } from "@/lib/email";

export const dynamic = "force-dynamic";

// Admin-only. Sends a sample confirmation email to the address in the
// ?to= query param (defaults to GMAIL_USER). Returns the actual failure
// reason if nodemailer rejects the send.
export async function GET(req: NextRequest) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to") || process.env.GMAIL_USER || "";
  if (!to) {
    return NextResponse.json(
      { ok: false, error: "No ?to= address and GMAIL_USER not set" },
      { status: 500 }
    );
  }

  try {
    await sendBookingConfirmation({
      to,
      customerName: "Test Customer",
      tripId: "SL-TEST-00000",
      pickup: "500 Canal Street, New Orleans, LA",
      dropoff: "Louis Armstrong New Orleans International Airport",
      tripDate: new Date().toISOString().slice(0, 10),
      tripTime: "14:30",
      rate: 105,
      passengers: 2,
      serviceType: "airport",
    });
    return NextResponse.json({ ok: true, to });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : String(e), to },
      { status: 500 }
    );
  }
}
