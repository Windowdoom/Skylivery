import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      phone,
      email,
      pickup,
      dropoff,
      date,
      time,
      serviceType,
      passengers,
      rate,
      rateType,
    } = body;

    if (!name || !phone || !pickup || !dropoff) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.SUPABASE_PUBLISHABLE_KEY ||
      "";

    if (!url || !anonKey) {
      return NextResponse.json(
        { error: "Booking service is not configured yet. Please call to book." },
        { status: 500 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Booking service is misconfigured. Please call to book." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, anonKey);

    // Human-readable booking reference: SL-YYYY-XXXXX
    const year = new Date().getFullYear();
    const suffix = Array.from({ length: 5 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32))
    ).join("");
    const tripId = `SL-${year}-${suffix}`;

    // Sensible defaults for every column that might be NOT NULL in the
    // original schema so we're not chasing errors one by one.
    const todayISO = new Date().toISOString().slice(0, 10);
    const tripDate = date || todayISO;
    const tripTime = time || "12:00";
    const nowISO = new Date().toISOString();

    const row = {
      trip_id: tripId,

      // Original-schema customer fields
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,

      // Original-schema trip fields
      trip_date: tripDate,
      trip_time: tripTime,
      pickup_location: pickup,
      dropoff_location: dropoff,
      pickup_datetime: `${tripDate}T${tripTime}:00`,

      // Our added columns (from the earlier ALTER TABLE)
      name,
      phone,
      email: email || null,
      pickup_address: pickup,
      dropoff_address: dropoff,
      pickup_date: tripDate,
      pickup_time: tripTime,
      service_type: serviceType || "transfer",
      passengers: Number(passengers) || 1,
      quoted_rate: rate ?? null,
      rate_type: rateType ?? null,
      status: "pending",
      created_at: nowISO,
    };

    const { error } = await supabase.from("bookings").insert(row);

    if (error) {
      // If Postgres says a specific column doesn't exist, strip it and retry
      // once. This lets us stay compatible with whichever columns the actual
      // schema has without hardcoding the exact set here.
      const match = /column '([^']+)' of '/i.exec(error.message);
      if (match) {
        const bad = match[1];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const trimmed: any = { ...row };
        delete trimmed[bad];
        const retry = await supabase.from("bookings").insert(trimmed);
        if (retry.error) {
          return NextResponse.json({ error: retry.error.message }, { status: 500 });
        }
      } else {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true, tripId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
