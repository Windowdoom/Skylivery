import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendSms, smsConfigured } from "@/lib/sms";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Runs once a day (see vercel.json) and texts every customer whose ride
// is scheduled for "tomorrow" (New Orleans local date) a reminder, so
// they don't no-show. Marks reminder_sent so a given booking is only
// ever texted once, however many times this job fires.
//
// Vercel's Hobby-tier cron only runs once per day, which is exactly
// what a day-before reminder needs — no upgrade required.

function tomorrowCentral(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(Date.now() + 24 * 60 * 60 * 1000));
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!smsConfigured()) {
    return NextResponse.json({ ok: true, skipped: "sms not configured" });
  }

  const sb = supabaseAdmin();
  const targetDate = tomorrowCentral();

  const { data: bookings, error } = await sb
    .from("bookings")
    .select("id, trip_id, customer_phone, customer_name, pickup_address, trip_time")
    .eq("trip_date", targetDate)
    .in("status", ["pending", "assigned"])
    .eq("reminder_sent", false);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!bookings || bookings.length === 0) {
    return NextResponse.json({ ok: true, sent: 0 });
  }

  let sent = 0;
  for (const b of bookings) {
    if (!b.customer_phone) continue;
    const res = await sendSms({
      to: b.customer_phone,
      body: [
        `Sky Livery reminder: your ride is tomorrow, ${b.trip_time?.slice(0, 5) ?? ""}.`,
        `Pickup: ${b.pickup_address}`,
        `Ref ${b.trip_id}. Need to change anything? Call (504) 339-6861.`,
      ].join(" "),
    });
    if (res.ok) sent += 1;
    await sb.from("bookings").update({ reminder_sent: true }).eq("id", b.id);
  }

  return NextResponse.json({ ok: true, sent, checked: bookings.length });
}
