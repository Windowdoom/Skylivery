"use server";
import { revalidatePath } from "next/cache";
import { currentDispatcher, requireAuth } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  sendReceipt,
  sendBookingConfirmation,
  sendDriverAssigned,
} from "@/lib/email";
import { ntfyPush } from "@/lib/ntfy";
import { refundByTripId, createCheckoutLink, squareConfigured } from "@/lib/square";

function guard() {
  return requireAuth();
}

function guardOwner() {
  return requireAuth({ owner: true });
}

export async function assignDriver(
  bookingId: string,
  driverId: string,
  vehicleId: string | null
) {
  const dispatcher = guard();
  const sb = supabaseAdmin();
  const assignedAtIso = new Date().toISOString();
  const update: Record<string, unknown> = {
    assigned_driver: driverId,
    status: "assigned",
    assigned_at: assignedAtIso,
    assigned_by: dispatcher.name,
  };
  if (vehicleId) update.vehicle_id = vehicleId;
  const { error } = await sb.from("bookings").update(update).eq("id", bookingId);
  if (error) throw new Error(error.message);

  // Fire an assignment push so the driver (and everyone on the shared
  // dispatch topic) knows the trip is on their plate.
  const { data: joined } = await sb
    .from("bookings")
    .select(
      "trip_id, customer_name, customer_phone, customer_email, pickup_address, dropoff_address, trip_date, trip_time, rate, payment_intent, paid, flight_number, drivers(name, phone), vehicles(cpnc_number, make, model, color)"
    )
    .eq("id", bookingId)
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
    const vehDesc = [vehObj?.color, vehObj?.make, vehObj?.model]
      .filter(Boolean)
      .join(" ") || null;
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
          `By: ${dispatcher.name}`,
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
            flightNumber: joined.flight_number ?? null,
          })
        : Promise.resolve(),
    ]);
  }

  revalidatePath("/admin");
}

export async function markCompleted(
  bookingId: string,
  paymentMethod: string,
  paid?: boolean
) {
  guard();
  const sb = supabaseAdmin();
  const completedAt = new Date().toISOString();
  // If caller passes an explicit paid flag, honor it. Otherwise infer:
  // invoice + online-link default to unpaid; cash + in-vehicle card
  // default to paid on the spot.
  const paidResolved =
    paid !== undefined
      ? paid
      : !["invoice", "online"].includes((paymentMethod || "").toLowerCase());
  const { error } = await sb
    .from("bookings")
    .update({
      status: "completed",
      completed_at: completedAt,
      payment_method: paymentMethod || null,
      paid: paidResolved,
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);

  // Fire-and-forget receipt email if the customer left one.
  const { data: booking } = await sb
    .from("bookings")
    .select(
      "trip_id, customer_name, customer_email, pickup_address, dropoff_address, trip_date, trip_time, rate, passengers, service_type"
    )
    .eq("id", bookingId)
    .single();

  // Await ntfy + receipt in parallel so Vercel doesn't drop them the
  // way it drops fire-and-forget promises in route handlers.
  const methodLabel = (() => {
    switch ((paymentMethod || "").toLowerCase()) {
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
        return paymentMethod || "—";
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
    booking?.customer_email
      ? sendReceipt({
          to: booking.customer_email,
          customerName: booking.customer_name,
          tripId: booking.trip_id,
          pickup: booking.pickup_address,
          dropoff: booking.dropoff_address,
          tripDate: booking.trip_date,
          tripTime: booking.trip_time,
          rate: booking.rate,
          paymentMethod: paymentMethod || null,
          completedAt,
          passengers: booking.passengers,
          serviceType: booking.service_type,
        })
      : Promise.resolve(),
    booking
      ? ntfyPush({
          title: `Completed · $${booking.rate ?? "?"} · ${methodLabel}`,
          body: [
            `${booking.trip_id}`,
            `${booking.customer_name}`,
            `↓ ${booking.dropoff_address}`,
            `Paid: ${methodLabel}`,
            `Closed at: ${completedAtLocal} CT`,
          ].join("\n"),
          tags: "moneybag,checkered_flag",
          priority: "default",
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/admin");
}

// Flip an existing booking's paid flag. Used for invoice and online-
// link bookings that get paid after the ride is complete.
export async function markPaid(bookingId: string, paid: boolean = true) {
  guard();
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("bookings")
    .update({ paid })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);

  if (paid) {
    const { data: b } = await sb
      .from("bookings")
      .select("trip_id, customer_name, rate, payment_method")
      .eq("id", bookingId)
      .single();
    if (b) {
      await ntfyPush({
        title: `Payment received · $${b.rate ?? "?"}`,
        body: [
          `${b.trip_id}`,
          `${b.customer_name}`,
          `Method: ${b.payment_method ?? "—"}`,
          `Paid: YES`,
        ].join("\n"),
        tags: "moneybag,white_check_mark",
        priority: "default",
      });
    }
  }
  revalidatePath("/admin");
}

// Manually create a booking from the admin dashboard. Used when a
// customer calls dispatch instead of using the site. Fires the same
// ntfy + email flow as a self-service booking.
export async function createBookingManually(input: {
  name: string;
  phone: string;
  email?: string;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  rate: number;
  serviceType?: string;
  passengers?: number;
  isAirport?: boolean;
  distanceMiles?: number;
  paymentIntent?: string;
  flightNumber?: string;
}): Promise<{ ok: boolean; tripId?: string; error?: string }> {
  const dispatcher = guard();
  const sb = supabaseAdmin();

  const year = new Date().getFullYear();
  const suffix = Array.from({ length: 5 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32))
  ).join("");
  const tripId = `SL-${year}-${suffix}`;

  const row = {
    trip_id: tripId,
    customer_name: input.name,
    customer_phone: input.phone,
    customer_email: input.email || null,
    pickup_address: input.pickup,
    dropoff_address: input.dropoff,
    trip_date: input.date,
    trip_time: input.time,
    service_type: input.serviceType || "transfer",
    passengers: input.passengers || 1,
    rate: input.rate,
    is_airport: !!input.isAirport,
    distance_miles: input.distanceMiles ?? null,
    status: "pending",
    payment_intent: input.paymentIntent || "in-vehicle",
    paid: false,
    flight_number: input.flightNumber || null,
    dispatched_by: dispatcher.name,
  };

  const { error } = await sb.from("bookings").insert(row);
  if (error) return { ok: false, error: error.message };

  // If dispatcher chose Pay Before and Square is set up, mint a real
  // checkout link so the customer gets the pay button in their email.
  let paymentLink: string | null = null;
  if (
    input.paymentIntent === "online" &&
    input.rate > 0 &&
    squareConfigured()
  ) {
    const link = await createCheckoutLink({
      tripId,
      amountCents: Math.round(input.rate * 100),
      customerName: input.name,
      customerEmail: input.email || null,
      pickup: input.pickup,
      dropoff: input.dropoff,
    });
    if (link) {
      paymentLink = link.url;
      await sb
        .from("bookings")
        .update({ payment_link: link.url, payment_link_id: link.id })
        .eq("trip_id", tripId)
        .then(() => undefined, () => undefined);
    }
  }

  const intentLabel =
    input.paymentIntent === "online"
      ? "Online link (Square)"
      : input.paymentIntent === "invoice"
        ? "Invoice"
        : "In-vehicle (card or cash)";

  await Promise.allSettled([
    ntfyPush({
      title: "New booking (via dispatch)",
      body: [
        `${tripId}`,
        ``,
        `${input.name}`,
        `${input.phone}`,
        input.email || "(no email)",
        ``,
        `↑ ${input.pickup}`,
        `↓ ${input.dropoff}`,
        input.flightNumber ? `Flight: ${input.flightNumber}` : "",
        `Pickup: ${input.date} ${input.time}`,
        `Fare: $${input.rate}`,
        `Pay: ${intentLabel}`,
        `Paid: no`,
        ``,
        `Entered by ${dispatcher.name}`,
      ]
        .filter(Boolean)
        .join("\n"),
      tags: "telephone_receiver,sparkles",
    }),
    input.email
      ? sendBookingConfirmation({
          to: input.email,
          customerName: input.name,
          tripId,
          pickup: input.pickup,
          dropoff: input.dropoff,
          tripDate: input.date,
          tripTime: input.time,
          rate: input.rate,
          passengers: input.passengers ?? 1,
          serviceType: input.serviceType || "transfer",
          flightNumber: input.flightNumber ?? null,
          paymentIntent: input.paymentIntent ?? "in-vehicle",
          paymentLink,
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/admin");
  return { ok: true, tripId };
}

// Apply our published cancellation policy: figure out what percent of the
// fare should be refunded based on how far out from pickup the cancel
// happens. Returns a fraction 0..1.
// Pickup date/time are stored as New Orleans local time, but Vercel runs
// in UTC — parsing them bare would shift everything 5–6 hours. Interpret
// them in America/Chicago using the real DST offset at that instant.
function pickupMsCentral(tripDate: string, hhmm: string): number {
  const asUtc = new Date(`${tripDate}T${hhmm}:00Z`).getTime();
  if (Number.isNaN(asUtc)) return NaN;
  const part = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    timeZoneName: "shortOffset",
  })
    .formatToParts(new Date(asUtc))
    .find((p) => p.type === "timeZoneName")?.value;
  const m = part?.match(/GMT([+-]\d+)(?::(\d+))?/);
  const offsetHours = m ? parseInt(m[1], 10) : -6;
  const offsetMins = m?.[2] ? parseInt(m[2], 10) * Math.sign(offsetHours) : 0;
  return asUtc - (offsetHours * 60 + offsetMins) * 60 * 1000;
}

function policyRefundFraction(
  tripDate: string,
  tripTime: string
): { fraction: number; label: string } {
  try {
    // trip_time comes back from Postgres as HH:MM:SS (time column) but is
    // stored as HH:MM from the forms — normalize to HH:MM exactly once.
    const t = (tripTime || "").slice(0, 5);
    const pickupMs = pickupMsCentral(tripDate, t);
    if (Number.isNaN(pickupMs)) return { fraction: 1, label: "unknown timing" };
    const hoursUntil = (pickupMs - Date.now()) / (60 * 60 * 1000);
    if (hoursUntil >= 2) return { fraction: 1, label: "2+ hours out" };
    return { fraction: 0, label: "under 2 hours" };
  } catch {
    return { fraction: 1, label: "unknown timing" };
  }
}

export async function cancelBooking(
  bookingId: string,
  opts?: { refund?: boolean; overrideFullRefund?: boolean }
): Promise<{ ok: boolean; refunded?: boolean; refundAmount?: number; error?: string }> {
  guard();
  const sb = supabaseAdmin();

  const { data: booking } = await sb
    .from("bookings")
    .select(
      "trip_id, rate, trip_date, trip_time, paid, customer_name, customer_email"
    )
    .eq("id", bookingId)
    .single();

  const { error } = await sb
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
  if (error) return { ok: false, error: error.message };

  let refunded = false;
  let refundAmount = 0;

  if (opts?.refund && booking?.paid && booking.rate) {
    const policy = opts.overrideFullRefund
      ? { fraction: 1, label: "manual full refund" }
      : policyRefundFraction(booking.trip_date, booking.trip_time);
    const refundCents = Math.round(booking.rate * 100 * policy.fraction);
    if (refundCents > 0) {
      const res = await refundByTripId({
        tripId: booking.trip_id,
        amountCents: refundCents,
        reason: `Cancellation (${policy.label})`,
      });
      if (res.ok) {
        refunded = true;
        refundAmount = refundCents / 100;
        await sb
          .from("bookings")
          .update({ paid: false })
          .eq("id", bookingId);
        await ntfyPush({
          title: `Refunded $${refundAmount} · ${booking.trip_id}`,
          body: [
            `${booking.customer_name}`,
            `Reason: ${policy.label}`,
            `Amount: $${refundAmount}`,
          ].join("\n"),
          tags: "arrows_counterclockwise,moneybag",
        }).catch(() => {});
      } else {
        // Refund failed but cancellation succeeded — surface the error
        revalidatePath("/admin");
        return { ok: true, error: `Cancelled, but refund failed: ${res.error}` };
      }
    }
  }

  revalidatePath("/admin");
  return { ok: true, refunded, refundAmount };
}

// Permanently remove a single booking. Use for test bookings that never
// happened; real cancellations should stay in the record via
// cancelBooking so trip_log analytics remain honest. Cascades to
// trip_log rows so a completed test booking can still be removed.
export async function deleteBooking(
  bookingId: string
): Promise<{ ok: boolean; error?: string }> {
  guardOwner();
  const sb = supabaseAdmin();

  // Best-effort cascade: remove any trip_log rows tied to the booking,
  // by either booking_id column or the trip_id string. Ignore per-table
  // errors so a missing column on one shape doesn't fail the whole call.
  const { data: booking } = await sb
    .from("bookings")
    .select("trip_id")
    .eq("id", bookingId)
    .single();

  await sb.from("trip_log").delete().eq("booking_id", bookingId).then(
    () => undefined,
    () => undefined
  );
  if (booking?.trip_id) {
    await sb.from("trip_log").delete().eq("trip_id", booking.trip_id).then(
      () => undefined,
      () => undefined
    );
  }

  const { error } = await sb.from("bookings").delete().eq("id", bookingId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

// Bulk-clear obvious test bookings. Matches anything whose customer name
// looks like a test entry ("test", "demo", "asdf", etc.) OR whose phone
// is one of the well-known throwaway numbers. Real customer data is
// never touched.
export async function clearTestBookings(): Promise<{
  deleted: number;
  error?: string;
}> {
  guardOwner();
  const sb = supabaseAdmin();
  const { data: matches, error: findErr } = await sb
    .from("bookings")
    .select("id, trip_id, customer_name, customer_phone")
    .or(
      [
        "customer_name.ilike.%test%",
        "customer_name.ilike.%demo%",
        "customer_name.ilike.%asdf%",
        "customer_name.ilike.%qwerty%",
        "customer_phone.eq.5551234567",
        "customer_phone.eq.1234567890",
        "customer_phone.eq.0000000000",
      ].join(",")
    );
  if (findErr) return { deleted: 0, error: findErr.message };
  const ids = (matches ?? []).map((m) => m.id);
  const tripIds = (matches ?? [])
    .map((m) => m.trip_id)
    .filter(Boolean) as string[];
  if (ids.length === 0) return { deleted: 0 };

  // Cascade to trip_log first, best-effort.
  await sb.from("trip_log").delete().in("booking_id", ids).then(
    () => undefined,
    () => undefined
  );
  if (tripIds.length > 0) {
    await sb.from("trip_log").delete().in("trip_id", tripIds).then(
      () => undefined,
      () => undefined
    );
  }

  const { error: delErr } = await sb.from("bookings").delete().in("id", ids);
  if (delErr) return { deleted: 0, error: delErr.message };
  revalidatePath("/admin");
  return { deleted: ids.length };
}

// -------- Vehicles --------

export async function createVehicle(input: {
  cpncNumber: string;
  make?: string;
  model?: string;
  color?: string;
  year?: number;
  plate?: string;
}): Promise<{ ok: boolean; error?: string; reactivated?: boolean }> {
  guardOwner();
  if (!input.cpncNumber?.trim()) {
    return { ok: false, error: "CPNC number is required." };
  }
  const sb = supabaseAdmin();
  const cpnc = input.cpncNumber.trim().toUpperCase();
  const payload = {
    make: input.make?.trim() || null,
    model: input.model?.trim() || null,
    color: input.color?.trim() || null,
    year: input.year || null,
    plate: input.plate?.trim().toUpperCase() || null,
  };

  // Look up existing row (active or retired) for this CPNC. If it
  // exists retired, reactivate + update; if active, reject; otherwise
  // insert fresh.
  const { data: existing } = await sb
    .from("vehicles")
    .select("id, active")
    .eq("cpnc_number", cpnc)
    .maybeSingle();

  if (existing) {
    if (existing.active) {
      return {
        ok: false,
        error: `CPNC ${cpnc} is already in the active fleet.`,
      };
    }
    const { error: updErr } = await sb
      .from("vehicles")
      .update({ ...payload, active: true })
      .eq("id", existing.id);
    if (updErr) return { ok: false, error: updErr.message };
    revalidatePath("/admin");
    return { ok: true, reactivated: true };
  }

  const { error } = await sb.from("vehicles").insert({
    cpnc_number: cpnc,
    ...payload,
    active: true,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function updateVehicle(
  vehicleId: string,
  patch: {
    make?: string | null;
    model?: string | null;
    color?: string | null;
    year?: number | null;
    plate?: string | null;
    active?: boolean;
  }
): Promise<{ ok: boolean; error?: string }> {
  guardOwner();
  const sb = supabaseAdmin();
  const clean: Record<string, unknown> = {};
  if (patch.make !== undefined) clean.make = patch.make || null;
  if (patch.model !== undefined) clean.model = patch.model || null;
  if (patch.color !== undefined) clean.color = patch.color || null;
  if (patch.year !== undefined) clean.year = patch.year || null;
  if (patch.plate !== undefined)
    clean.plate = patch.plate ? patch.plate.trim().toUpperCase() : null;
  if (patch.active !== undefined) clean.active = patch.active;
  const { error } = await sb
    .from("vehicles")
    .update(clean)
    .eq("id", vehicleId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin");
  return { ok: true };
}

export async function retireVehicle(vehicleId: string) {
  return updateVehicle(vehicleId, { active: false });
}

export async function activateVehicle(vehicleId: string) {
  return updateVehicle(vehicleId, { active: true });
}
