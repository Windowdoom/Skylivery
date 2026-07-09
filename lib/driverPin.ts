// Shared PIN-lockout guard for the two driver-facing endpoints that
// verify identity via "last 4 digits of the phone on file" (the ntfy
// claim page and the push-notification setup page). A 4-digit PIN is
// only 10,000 combinations — without a lockout, an attacker who can
// see a driver's name in either page's dropdown could brute-force it.
// The push-subscribe endpoint makes this materially worse than a
// one-shot claim: a successful guess there persistently registers the
// attacker's device to receive that driver's future trip offers, not
// just steal one claim. Locking after repeated failures closes both.

import { supabaseAdmin } from "./supabaseAdmin";
import { phoneDigits } from "./sms";

const MAX_FAILURES = 5;
const LOCKOUT_MINUTES = 15;

export async function verifyDriverPin(
  driverId: string,
  pin: string
): Promise<{
  ok: boolean;
  error?: string;
  driver?: { id: string; name: string; phone: string; primary_vehicle: string | null };
}> {
  const sb = supabaseAdmin();
  const { data: driver } = await sb
    .from("drivers")
    .select("id, name, phone, primary_vehicle, active, pin_failures, pin_locked_until")
    .eq("id", driverId)
    .eq("active", true)
    .single();
  if (!driver) return { ok: false, error: "Driver not found" };

  if (driver.pin_locked_until && new Date(driver.pin_locked_until) > new Date()) {
    return {
      ok: false,
      error: `Too many attempts. Try again in a few minutes, or call dispatch.`,
    };
  }

  const last4 = phoneDigits(driver.phone || "").slice(-4);
  const matches = !!last4 && String(pin).trim() === last4;

  if (!matches) {
    const failures = (driver.pin_failures || 0) + 1;
    const update: Record<string, unknown> = { pin_failures: failures };
    if (failures >= MAX_FAILURES) {
      update.pin_locked_until = new Date(
        Date.now() + LOCKOUT_MINUTES * 60 * 1000
      ).toISOString();
    }
    await sb.from("drivers").update(update).eq("id", driverId);
    return { ok: false, error: "That PIN doesn't match our records for this driver." };
  }

  if (driver.pin_failures || driver.pin_locked_until) {
    await sb
      .from("drivers")
      .update({ pin_failures: 0, pin_locked_until: null })
      .eq("id", driverId);
  }
  return {
    ok: true,
    driver: {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      primary_vehicle: driver.primary_vehicle,
    },
  };
}
