import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyWebhookSignature } from "@/lib/square";
import { ntfyPush } from "@/lib/ntfy";
import { sendReceipt } from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Endpoint Square hits when a payment completes on one of our Checkout
// links. We look up the booking by trip_id (Square passes it back in
// reference_id / paymentNote / description) and flip paid = true.
//
// Register this URL in Square Dashboard → Webhooks:
//   https://www.skyliverynola.com/api/webhooks/square
// Subscribe to: payment.created, payment.updated
// Copy the signature key into env var SQUARE_WEBHOOK_SIGNATURE_KEY.

type SquareEvent = {
  type?: string;
  event_id?: string;
  data?: {
    object?: {
      payment?: {
        id?: string;
        status?: string;
        amount_money?: { amount?: number; currency?: string };
        reference_id?: string;
        note?: string;
        order_id?: string;
      };
    };
  };
};

// Extract our SL-YYYY-XXXXX trip_id from any field Square might have it in.
function extractTripId(payment: NonNullable<
  NonNullable<NonNullable<SquareEvent["data"]>["object"]>["payment"]
>): string | null {
  const candidates = [payment.reference_id, payment.note];
  const re = /SL-\d{4}-[A-Z0-9]{5}/;
  for (const c of candidates) {
    if (!c) continue;
    const m = c.match(re);
    if (m) return m[0];
  }
  return null;
}

export async function POST(req: NextRequest) {
  const raw = await req.text();

  // Verify signature so only real Square events are trusted.
  const sig = req.headers.get("x-square-hmacsha256-signature");
  const url = req.nextUrl.toString();
  const valid = verifyWebhookSignature(raw, sig, url);
  if (!valid && process.env.SQUARE_WEBHOOK_SIGNATURE_KEY) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: SquareEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const payment = event?.data?.object?.payment;
  if (!payment || payment.status !== "COMPLETED") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const tripId = extractTripId(payment);
  if (!tripId) {
    console.error("[square-webhook] no trip_id found on payment", payment.id);
    return NextResponse.json({ ok: true, unmatched: true });
  }

  const sb = supabaseAdmin();

  const { data: booking } = await sb
    .from("bookings")
    .select(
      "id, trip_id, customer_name, customer_email, pickup_address, dropoff_address, trip_date, trip_time, rate, passengers, service_type, paid"
    )
    .eq("trip_id", tripId)
    .single();

  if (!booking) {
    console.error("[square-webhook] no booking for trip_id", tripId);
    return NextResponse.json({ ok: true, unmatched: true });
  }

  // Idempotency: don't double-fire notifications if the webhook retries.
  const alreadyPaid = booking.paid === true;
  if (!alreadyPaid) {
    const amountDollars = payment.amount_money?.amount
      ? Number(payment.amount_money.amount) / 100
      : booking.rate;
    await sb
      .from("bookings")
      .update({
        paid: true,
        payment_method: "square",
        payment_captured_at: new Date().toISOString(),
      })
      .eq("id", booking.id);

    await Promise.allSettled([
      ntfyPush({
        title: `Payment received · $${amountDollars ?? "?"}`,
        body: [
          `${tripId}`,
          `${booking.customer_name}`,
          `Method: Card (Square)`,
          `Paid: YES`,
        ].join("\n"),
        tags: "moneybag,white_check_mark",
        priority: "high",
      }),
      booking.customer_email
        ? sendReceipt({
            to: booking.customer_email,
            customerName: booking.customer_name,
            tripId,
            pickup: booking.pickup_address,
            dropoff: booking.dropoff_address,
            tripDate: booking.trip_date,
            tripTime: booking.trip_time,
            rate: amountDollars,
            paymentMethod: "square",
            completedAt: new Date().toISOString(),
            passengers: booking.passengers,
            serviceType: booking.service_type,
          })
        : Promise.resolve(),
    ]);
  }

  return NextResponse.json({ ok: true });
}
