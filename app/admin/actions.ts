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
