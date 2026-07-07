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

    // Accept either the browser-safe names or the plain ones added by
    // Supabase's Vercel integration.
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    const anonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      process.env.SUPABASE_ANON_KEY ||
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

    const { data, error } = await supabase
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
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id: data?.id });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
