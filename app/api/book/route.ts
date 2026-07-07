import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";
import { ntfyPush } from "@/lib/ntfy";

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
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceMiles,
      internalZone,
      paymentIntent,
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

    // NOT NULL defaults: pickup date/time default to now so a quick booking
    // without explicit time still lands cleanly.
    const now = new Date();
    const tripDate = date || now.toISOString().slice(0, 10);
    const tripTime = time || now.toTimeString().slice(0, 5);

    // Row matches the bookings table schema exactly.
    const row = {
      trip_id: tripId,
      customer_name: name,
      customer_phone: phone,
      customer_email: email || null,
      pickup_address: pickup,
      dropoff_address: dropoff,
      pickup_lat: pickupLat ?? null,
      pickup_lng: pickupLng ?? null,
      dropoff_lat: dropoffLat ?? null,
      dropoff_lng: dropoffLng ?? null,
      trip_date: tripDate,
      trip_time: tripTime,
      service_type: serviceType || "transfer",
      passengers: Number(passengers) || 1,
      internal_zone: internalZone ?? null,
      rate: rate ?? 0,
      is_airport: rateType === "airport",
      distance_miles: distanceMiles ?? null,
      status: "pending",
      payment_intent: paymentIntent || "in-vehicle",
      paid: false,
    };

    const { error } = await supabase.from("bookings").insert(row);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Await both side-effects before returning. Fire-and-forget doesn't
    // work on Vercel serverless — the runtime terminates the function as
    // soon as the response is sent and kills pending promises. Running
    // them in parallel keeps the user-facing delay to the slower of the
    // two (~1–2s for Gmail SMTP handshake).
    const intentLabel =
      paymentIntent === "online"
        ? "Online link (Square)"
        : paymentIntent === "invoice"
          ? "Invoice"
          : "In-vehicle (card or cash)";

    await Promise.allSettled([
      ntfyPush({
        title: "New Sky Livery booking",
        body: [
          `${tripId}`,
          ``,
          `${name}`,
          `${phone}`,
          email ? email : "(no email)",
          ``,
          `↑ ${pickup}`,
          `↓ ${dropoff}`,
          `Pickup: ${tripDate} ${tripTime}`,
          `Fare: $${rate ?? "?"}`,
          `Pay: ${intentLabel}`,
          `Paid: no`,
        ].join("\n"),
        tags: "oncoming_automobile,sparkles",
      }),
      email
        ? sendBookingConfirmation({
            to: email,
            customerName: name,
            tripId,
            pickup,
            dropoff,
            tripDate,
            tripTime,
            rate: rate ?? null,
            passengers: Number(passengers) || 1,
            serviceType: serviceType || "transfer",
          })
        : Promise.resolve(),
    ]);

    return NextResponse.json({ ok: true, tripId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
