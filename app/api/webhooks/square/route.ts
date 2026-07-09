import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
        card_details?: { card?: { last_4?: string } };
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
  const sigConfigured = !!process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;

  let event: SquareEvent = {};
  try {
    event = JSON.parse(raw);
  } catch {
    // fall through — treated as an event with no payment below
  }
  const payment = event?.data?.object?.payment;

  if (!valid && sigConfigured) {
    // Someone posted to our webhook with a bad signature — worth knowing.
    await ntfyPush({
      title: "Square webhook: BAD SIGNATURE",
      body: [
        `Type: ${event?.type ?? "unknown"}`,
        `Event ID: ${event?.event_id ?? "—"}`,
        `Rejected — signature did not verify.`,
      ].join("\n"),
      tags: "warning,square",
      priority: "high",
    }).catch(() => {});
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  if (!payment || payment.status !== "COMPLETED") {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const tripId = extractTripId(payment);
  if (!tripId) {
    // A real completed payment we couldn't match to a trip — dispatch
    // should reconcile it manually in the Square dashboard.
    console.error("[square-webhook] no trip_id found on payment", payment.id);
    await ntfyPush({
      title: "Square payment UNMATCHED",
      body: [
        `Payment ID: ${payment.id ?? "—"}`,
        `Amount: $${payment.amount_money?.amount ? Number(payment.amount_money.amount) / 100 : "?"}`,
        `No trip reference found — check the Square dashboard and mark the booking paid by hand.`,
      ].join("\n"),
      tags: "warning,moneybag",
      priority: "high",
    }).catch(() => {});
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
    await ntfyPush({
      title: "Square payment for unknown trip",
      body: [
        `Reference: ${tripId}`,
        `Payment ID: ${payment.id ?? "—"}`,
        `Amount: $${payment.amount_money?.amount ? Number(payment.amount_money.amount) / 100 : "?"}`,
        `Paid, but no matching booking in the system.`,
      ].join("\n"),
      tags: "warning,moneybag",
      priority: "high",
    }).catch(() => {});
    return NextResponse.json({ ok: true, unmatched: true });
  }

  // Idempotency: don't double-fire notifications if the webhook retries.
  const alreadyPaid = booking.paid === true;
  if (!alreadyPaid) {
    const amountDollars = payment.amount_money?.amount
      ? Number(payment.amount_money.amount) / 100
      : booking.rate;
    const cardLast4 = payment.card_details?.card?.last_4 ?? null;
    await sb
      .from("bookings")
      .update({
        paid: true,
        payment_method: "square",
        payment_captured_at: new Date().toISOString(),
        card_last4: cardLast4,
      })
      .eq("id", booking.id);

    // Refresh the admin dashboard so the PAID badge shows without a
    // manual hard refresh.
    revalidatePath("/admin");

    await Promise.allSettled([
      ntfyPush({
        title: `Payment received · $${amountDollars ?? "?"}`,
        body: [
          `${tripId}`,
          `${booking.customer_name}`,
          `Method: Card (Square)${cardLast4 ? ` •••• ${cardLast4}` : ""}`,
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
            cardLast4,
          })
        : Promise.resolve(),
    ]);
  }

  return NextResponse.json({ ok: true });
}
