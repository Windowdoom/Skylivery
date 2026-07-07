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

    // Accept every naming Supabase's Vercel integration might have wired up:
    // legacy (SUPABASE_URL / anon), NEXT_PUBLIC_* legacy, or the newer
    // "publishable" key naming.
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

    // Guard against malformed URLs so we return a friendly JSON error instead
    // of crashing on createClient throwing "Invalid supabaseUrl".
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Booking service is misconfigured. Please call to book." },
        { status: 500 }
      );
    }

    const supabase = createClient(url, anonKey);

    // Insert without .select() — anon doesn't have SELECT grant on bookings
    // (and shouldn't; we don't want the public reading anyone's bookings).
    // Chaining .select() would trigger a RETURNING clause that requires SELECT.
    const { error } = await supabase
      .from("bookings")
      .insert({
        name,
        phone,
        email: email || null,
        pickup_address: pickup,
        dropoff_address: dropoff,
        pickup_date: date || null,
        pickup_time: time || null,
        service_type: serviceType || "transfer",
        passengers: Number(passengers) || 1,
        quoted_rate: rate ?? null,
        rate_type: rateType ?? null,
        status: "pending",
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
