"use server";
import { revalidatePath } from "next/cache";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function guard() {
  if (!isAuthed()) throw new Error("unauthorized");
}

export async function assignDriver(bookingId: string, driverId: string) {
  guard();
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("bookings")
    .update({ assigned_driver: driverId, status: "assigned" })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin");
}

export async function markCompleted(bookingId: string, paymentMethod: string) {
  guard();
  const sb = supabaseAdmin();
  const { error } = await sb
    .from("bookings")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      payment_method: paymentMethod || null,
    })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
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
