// Shared driver-assignment pipeline. Called from the admin dashboard
// (dispatcher picks a driver) and from the driver self-claim page (driver
// taps their own name in the ntfy push). Updates the booking, then fires
// the assignment ntfy + customer email.

import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "./supabaseAdmin";
import { ntfyPush } from "./ntfy";
import { sendDriverAssigned } from "./email";

const SECRET = () =>
  process.env.ADMIN_HMAC_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sky-livery-fallback-dev-secret";

// Compact signed token so the claim link in a push can't be forged or
// reused across trips. No DB storage needed.
export function claimToken(tripId: string): string {
  return createHmac("sha256", SECRET())
    .update(`claim:${tripId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyClaimToken(tripId: string, token: string): boolean {
  const expected = claimToken(tripId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function claimUrl(tripId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/claim/${encodeURIComponent(tripId)}?t=${claimToken(tripId)}`;
}

export async function assignDriverToBooking(input: {
  bookingId: string;
  driverId: string;
  vehicleId: string | null;
  byLabel: string; // e.g. "Dispatch 1" or "Marcus (self-claim)"
}): Promise<{ ok: boolean; error?: string }> {
  const sb = supabaseAdmin();
  const assignedAtIso = new Date().toISOString();
  const update: Record<string, unknown> = {
    assigned_driver: input.driverId,
    status: "assigned",
    assigned_at: assignedAtIso,
    assigned_by: input.byLabel,
  };
  if (input.vehicleId) update.vehicle_id = input.vehicleId;
  const { error } = await sb
    .from("bookings")
    .update(update)
    .eq("id", input.bookingId);
  if (error) return { ok: false, error: error.message };

  const { data: joined } = await sb
    .from("bookings")
    .select(
      "trip_id, customer_name, customer_phone, customer_email, pickup_address, dropoff_address, trip_date, trip_time, rate, payment_intent, payment_link, paid, flight_number, drivers(name, phone), vehicles(cpnc_number, make, model, color)"
    )
    .eq("id", input.bookingId)
    .single();

  if (joined) {
    const drvName = (joined.drivers as unknown as { name?: string } | null)?.name;
    const drvPhone = (joined.drivers as unknown as { phone?: string } | null)?.phone;
    const vehObj = joined.vehicles as unknown as {
      cpnc_number?: string;
      make?: string;
      model?: string;
      color?: string;
    } | null;
    const veh = vehObj?.cpnc_number;
    const vehDesc =
      [vehObj?.color, vehObj?.make, vehObj?.model].filter(Boolean).join(" ") ||
      null;
    const assignedAt = new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const intentLabel = (() => {
      switch (joined.payment_intent) {
        case "online":
          return "Online link (Square)";
        case "invoice":
          return "Invoice";
        case "in-vehicle":
          return "In-vehicle (card or cash)";
        default:
          return joined.payment_intent || "—";
      }
    })();
    await Promise.allSettled([
      ntfyPush({
        title: `Assigned → ${drvName ?? "driver"}${veh ? " · " + veh : ""}`,
        body: [
          `${joined.trip_id}`,
          `Driver: ${drvName ?? "—"}`,
          drvPhone ? `Driver phone: ${drvPhone}` : "",
          veh ? `Vehicle: ${veh}` : "",
          vehDesc ? `Car: ${vehDesc}` : "",
          `Assigned at: ${assignedAt} CT`,
          `By: ${input.byLabel}`,
          ``,
          `Customer: ${joined.customer_name}`,
          `Phone: ${joined.customer_phone}`,
          joined.customer_email ? `Email: ${joined.customer_email}` : "",
          ``,
          `↑ ${joined.pickup_address}`,
          `↓ ${joined.dropoff_address}`,
          joined.flight_number ? `Flight: ${joined.flight_number}` : "",
          `Pickup: ${joined.trip_date} ${joined.trip_time}`,
          `Fare: $${joined.rate ?? "?"}`,
          `Pay: ${intentLabel}`,
          `Paid: ${joined.paid ? "YES" : "NO"}`,
          !joined.paid && joined.payment_intent === "in-vehicle"
            ? `⚠ COLLECT $${joined.rate ?? "?"} · REF ${joined.trip_id}`
            : "",
          !joined.paid && joined.payment_link
            ? `Pay link: ${joined.payment_link}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
        tags: "car,white_check_mark",
      }),
      joined.customer_email
        ? sendDriverAssigned({
            to: joined.customer_email,
            customerName: joined.customer_name,
            tripId: joined.trip_id,
            pickup: joined.pickup_address,
            dropoff: joined.dropoff_address,
            tripDate: joined.trip_date,
            tripTime: joined.trip_time,
            rate: joined.rate,
            driverName: drvName ?? null,
            driverPhone: drvPhone ?? null,
            vehicleCpnc: veh ?? null,
            vehicleDescription: vehDesc,
            paid: joined.paid,
            paymentIntent: joined.payment_intent,
            paymentLink: joined.payment_link ?? null,
            flightNumber: joined.flight_number ?? null,
          })
        : Promise.resolve(),
    ]);
  }

  return { ok: true };
}
