"use server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendReceipt } from "@/lib/email";

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
  const update: Record<string, unknown> = {
    assigned_driver: driverId,
    status: "assigned",
  };
  if (vehicleId) update.vehicle_id = vehicleId;
  const { error } = await sb.from("bookings").update(update).eq("id", bookingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function markCompleted(bookingId: string, paymentMethod: string) {
  guard();
  const sb = supabaseAdmin();
  const completedAt = new Date().toISOString();
  const { error } = await sb
    .from("bookings")
    .update({
      status: "completed",
      completed_at: completedAt,
      payment_method: paymentMethod || null,
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

  if (booking?.customer_email) {
    sendReceipt({
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
    }).catch(() => {});
  }

  revalidatePath("/admin");
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
