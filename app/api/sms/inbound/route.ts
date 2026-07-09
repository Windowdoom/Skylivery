import { NextRequest, NextResponse } from "next/server";
import { verifyTwilioSignature } from "@/lib/sms";
import { handleDriverSmsReply } from "@/lib/driverOffers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Twilio webhook for inbound SMS. Configure in Twilio Console → Phone
// Numbers → your number → Messaging → "A message comes in" → Webhook:
//   https://www.skyliverynola.com/api/sms/inbound   (HTTP POST)
//
// Drivers reply Y/N to the trip-offer text sent by offerTripToDrivers().
// We always return empty TwiML (no auto-reply) — any reply text we want
// to send goes out explicitly via sendSms() so it's logged the same way
// as every other outbound message.

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const params = Object.fromEntries(new URLSearchParams(raw));
  const signature = req.headers.get("x-twilio-signature");
  const url = req.nextUrl.toString();

  if (!verifyTwilioSignature(url, params, signature)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const from = params.From || "";
  const body = params.Body || "";
  if (from && body) {
    await handleDriverSmsReply(from, body).catch((e) =>
      console.error("[sms-inbound] handling failed:", e)
    );
  }

  return new NextResponse(EMPTY_TWIML, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}
