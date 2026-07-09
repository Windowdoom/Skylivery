// Two-way SMS dispatch: text every active driver when a new trip comes
// in, let them reply Y to take it or N to pass. First Y wins (atomic
// claim via assignDriverToBooking's requirePending guard); everyone
// else who was offered gets a short "already taken" text so they're
// not left wondering. Runs alongside the existing ntfy "Claim trip"
// button — this is a second channel for drivers without the ntfy app.

import { supabaseAdmin } from "./supabaseAdmin";
import { sendSms, smsConfigured, phoneDigits } from "./sms";
import { assignDriverToBooking } from "./assign";
import { ntfyPush } from "./ntfy";

export async function offerTripToDrivers(tripId: string): Promise<void> {
  if (!smsConfigured()) return;
  const sb = supabaseAdmin();

  const { data: booking } = await sb
    .from("bookings")
    .select("id, trip_id, pickup_address, dropoff_address, trip_date, trip_time, rate, status")
    .eq("trip_id", tripId)
    .single();
  if (!booking || booking.status !== "pending") return;

  const { data: drivers } = await sb
    .from("drivers")
    .select("id, name, phone")
    .eq("active", true);

  // Don't offer a trip to a driver who's already out on an unfinished
  // one — they can still text N if they'd rather pass anyway, but this
  // keeps the blast relevant once you're running several trips at once.
  const { data: busyRows } = await sb
    .from("bookings")
    .select("assigned_driver")
    .eq("status", "assigned")
    .not("assigned_driver", "is", null);
  const busyIds = new Set((busyRows || []).map((r) => r.assigned_driver as string));

  const withPhone = (drivers || []).filter((d) => d.phone && !busyIds.has(d.id));
  if (withPhone.length === 0) return;

  const msg = [
    `Sky Livery — new trip ${booking.trip_id}`,
    `${booking.pickup_address} → ${booking.dropoff_address}`,
    `${booking.trip_date} ${booking.trip_time} · $${booking.rate ?? "?"}`,
    `Reply Y to take it, N to pass.`,
  ].join("\n");

  await sb.from("sms_offers").insert(
    withPhone.map((d) => ({
      booking_id: booking.id,
      driver_id: d.id,
      trip_id: booking.trip_id,
      phone: d.phone,
    }))
  );

  await Promise.allSettled(
    withPhone.map((d) => sendSms({ to: d.phone as string, body: msg }))
  );
}

export async function handleDriverSmsReply(
  fromRaw: string,
  bodyRaw: string
): Promise<void> {
  const sb = supabaseAdmin();
  const body = (bodyRaw || "").trim();
  const fromDigits = phoneDigits(fromRaw);

  const { data: drivers } = await sb
    .from("drivers")
    .select("id, name, phone")
    .eq("active", true);
  const driver = (drivers || []).find(
    (d) => d.phone && phoneDigits(d.phone) === fromDigits
  );
  if (!driver || !driver.phone) return; // unknown sender — ignore silently

  const { data: offers } = await sb
    .from("sms_offers")
    .select("id, booking_id, trip_id, bookings(status)")
    .eq("driver_id", driver.id)
    .is("response", null)
    .order("sent_at", { ascending: false })
    .limit(5);

  const offer = (offers || []).find(
    (o) => (o.bookings as unknown as { status?: string } | null)?.status === "pending"
  );

  if (!offer) {
    await sendSms({ to: driver.phone, body: "No open trip offer for you right now." });
    return;
  }

  const isYes = /^y/i.test(body);
  const isNo = /^n/i.test(body);

  if (!isYes && !isNo) {
    await sendSms({
      to: driver.phone,
      body: `Reply Y to take trip ${offer.trip_id}, or N to pass.`,
    });
    return;
  }

  if (isNo) {
    await sb
      .from("sms_offers")
      .update({ response: "N", responded_at: new Date().toISOString() })
      .eq("id", offer.id);
    await sendSms({ to: driver.phone, body: "Got it, thanks!" });

    // If every driver who was offered this trip has now said no (and
    // nobody else is still pending a reply), tell dispatch right away
    // instead of leaving the trip to sit silently unclaimed.
    const { data: stillOpen } = await sb
      .from("sms_offers")
      .select("id")
      .eq("booking_id", offer.booking_id)
      .is("response", null);
    if (!stillOpen || stillOpen.length === 0) {
      const { data: stillPending } = await sb
        .from("bookings")
        .select("status")
        .eq("id", offer.booking_id)
        .single();
      if (stillPending?.status === "pending") {
        await ntfyPush({
          title: `⚠ No driver for ${offer.trip_id}`,
          body: `Every driver texted has passed on ${offer.trip_id}. Call one directly or assign manually.`,
          tags: "warning,no_entry_sign",
          priority: "urgent",
        }).catch(() => {});
      }
    }
    return;
  }

  const res = await assignDriverToBooking({
    bookingId: offer.booking_id,
    driverId: driver.id,
    vehicleId: null,
    byLabel: `${driver.name} (SMS accept)`,
    requirePending: true,
  });

  if (!res.ok) {
    await sb
      .from("sms_offers")
      .update({ response: "N", responded_at: new Date().toISOString() })
      .eq("id", offer.id);
    await sendSms({
      to: driver.phone,
      body: `Sorry, ${offer.trip_id} was already taken. We'll text you the next one.`,
    });
    return;
  }

  await sb
    .from("sms_offers")
    .update({ response: "Y", responded_at: new Date().toISOString() })
    .eq("id", offer.id);

  const { data: others } = await sb
    .from("sms_offers")
    .select("id, phone")
    .eq("booking_id", offer.booking_id)
    .is("response", null)
    .neq("driver_id", driver.id);

  if (others && others.length > 0) {
    await sb
      .from("sms_offers")
      .update({ response: "expired", responded_at: new Date().toISOString() })
      .in("id", others.map((o) => o.id));
    await Promise.allSettled(
      others.map((o) =>
        sendSms({
          to: o.phone,
          body: `${offer.trip_id} has been taken — thanks for the quick reply!`,
        })
      )
    );
  }
}
