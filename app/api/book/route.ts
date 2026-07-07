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
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceMiles,
      internalZone,
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
    };

    const { error } = await supabase.from("bookings").insert(row);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Fire-and-forget ntfy push so dispatch gets an instant phone ping.
    // Configure via NTFY_URL (e.g. https://ntfy.sh/skylivery-bookings-xxxx).
    const ntfyUrl = process.env.NTFY_URL;
    if (ntfyUrl) {
      const body = [
        `${tripId}`,
        `${name} · ${phone}`,
        `${pickup} → ${dropoff}`,
        `${tripDate} ${tripTime} · $${rate ?? "?"}`,
      ].join("\n");
      fetch(ntfyUrl, {
        method: "POST",
        headers: {
          Title: "New Sky Livery booking",
          Priority: "high",
          Tags: "oncoming_automobile,sparkles",
        },
        body,
      }).catch(() => {});
    }

    return NextResponse.json({ ok: true, tripId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
