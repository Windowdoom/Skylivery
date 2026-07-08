"use server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import {
  sendReceipt,
  sendBookingConfirmation,
  sendDriverAssigned,
} from "@/lib/email";
import { ntfyPush } from "@/lib/ntfy";

function guard() {
  if (!isAuthed()) throw new Error("unauthorized");
}

export async function assignDriver(
  bookingId: string,
  driverId: string,
  vehicleId: string | null
) {
  guard();
  const sb = supabaseAdmin();
  const assignedAtIso = new Date().toISOString();
  const update: Record<string, unknown> = {
    assigned_driver: driverId,
    status: "assigned",
    assigned_at: assignedAtIso,
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
  guard();
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
  };

  const { error } = await sb.from("bookings").insert(row);
  if (error) return { ok: false, error: error.message };

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
        `Entered manually by dispatch.`,
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
        })
      : Promise.resolve(),
  ]);

  revalidatePath("/admin");
  return { ok: true, tripId };
}

export async function cancelBooking(bookingId: string) {
  guard();
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

// Permanently remove a single booking. Use for test bookings that never
// happened; real cancellations should stay in the record via
// cancelBooking so trip_log analytics remain honest. Cascades to
// trip_log rows so a completed test booking can still be removed.
export async function deleteBooking(
  bookingId: string
): Promise<{ ok: boolean; error?: string }> {
  guard();
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
  guard();
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
