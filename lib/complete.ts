// Shared trip-completion pipeline. Called from the admin dashboard
// (dispatcher closes out a trip) and from the driver-facing complete
// link texted to them on assignment — same underlying logic either
// way, so behavior (receipts, notifications) never drifts between the
// two entry points.

import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";
import { ntfyPush } from "./ntfy";
import { sendReceipt } from "./email";

const SECRET = () =>
  process.env.ADMIN_HMAC_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sky-livery-fallback-dev-secret";

// Separate namespace from claimToken so a claim link can't be replayed
// to complete a trip and vice versa.
export function completeToken(tripId: string): string {
  return createHmac("sha256", SECRET())
    .update(`complete:${tripId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyCompleteToken(tripId: string, token: string): boolean {
  const expected = completeToken(tripId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function completeUrl(tripId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/complete/${encodeURIComponent(tripId)}?t=${completeToken(tripId)}`;
}

export async function completeBookingCore(input: {
  bookingId: string;
  // What the driver/dispatcher selected. Ignored if the trip was
  // already paid (e.g. via the Square link) — we keep the real record
  // of how it was actually paid rather than overwriting it.
  paymentMethod: string;
  // Cash amount collected, if it differs from the booked rate (tips,
  // rounding, a negotiated adjustment). Only applies to cash.
  cashAmount?: number;
  completedByLabel?: string;
}): Promise<{ ok: boolean; error?: string; alreadyCompleted?: boolean }> {
  const sb = supabaseAdmin();
  const completedAt = new Date().toISOString();

  const { data: booking } = await sb
    .from("bookings")
    .select(
      "trip_id, status, customer_name, customer_email, pickup_address, dropoff_address, trip_date, trip_time, rate, passengers, service_type, paid, payment_method"
    )
    .eq("id", input.bookingId)
    .single();

  if (!booking) return { ok: false, error: "Trip not found." };
  if (booking.status === "completed") {
    return { ok: true, alreadyCompleted: true };
  }
  if (booking.status === "cancelled") {
    return { ok: false, error: "This trip was cancelled." };
  }

  const wasAlreadyPaid = booking.paid === true;
  const finalRate =
    !wasAlreadyPaid &&
    input.paymentMethod === "cash" &&
    input.cashAmount &&
    input.cashAmount > 0
      ? input.cashAmount
      : booking.rate;

  const paidResolved =
    wasAlreadyPaid ||
    !["invoice", "online"].includes((input.paymentMethod || "").toLowerCase());

  const update: Record<string, unknown> = {
    status: "completed",
    completed_at: completedAt,
    payment_method: wasAlreadyPaid
      ? booking.payment_method || input.paymentMethod || null
      : input.paymentMethod || null,
    paid: paidResolved,
  };
  if (finalRate !== booking.rate) update.rate = finalRate;

  const { error } = await sb
    .from("bookings")
    .update(update)
    .eq("id", input.bookingId);
  if (error) return { ok: false, error: error.message };

  const methodLabel = (() => {
    switch ((input.paymentMethod || "").toLowerCase()) {
      case "square":
      case "card":
        return "Card (Square)";
      case "cash":
        return "Cash";
      case "invoice":
        return "Invoice";
      case "third_party":
        return "Third-party";
      default:
        return input.paymentMethod || "—";
    }
  })();

  const completedAtLocal = new Date().toLocaleString("en-US", {
    timeZone: "America/Chicago",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  await Promise.allSettled([
    booking.customer_email && !wasAlreadyPaid
      ? sendReceipt({
          to: booking.customer_email,
          customerName: booking.customer_name,
          tripId: booking.trip_id,
          pickup: booking.pickup_address,
          dropoff: booking.dropoff_address,
          tripDate: booking.trip_date,
          tripTime: booking.trip_time,
          rate: finalRate,
          paymentMethod: input.paymentMethod || null,
          completedAt,
          passengers: booking.passengers,
          serviceType: booking.service_type,
        })
      : Promise.resolve(),
    ntfyPush({
      title: `Completed · $${finalRate ?? "?"} · ${methodLabel}`,
      body: [
        `${booking.trip_id}`,
        `${booking.customer_name}`,
        `↓ ${booking.dropoff_address}`,
        `Paid: ${methodLabel}`,
        input.completedByLabel ? `Closed by: ${input.completedByLabel}` : "",
        `Closed at: ${completedAtLocal} CT`,
      ]
        .filter(Boolean)
        .join("\n"),
      tags: "moneybag,checkered_flag",
      priority: "default",
    }),
  ]);

  return { ok: true };
}
