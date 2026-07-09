import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmation } from "@/lib/email";
import { ntfyPush } from "@/lib/ntfy";
import { createCheckoutLink, squareConfigured } from "@/lib/square";
import { claimUrl } from "@/lib/assign";
import { offerTripToDrivers } from "@/lib/driverOffers";
import {
  calculateRate,
  distanceMiles as haversineMiles,
  HOURLY_RATE,
  HOURLY_MIN_WEEKDAY,
  HOURLY_MIN_WEEKEND,
} from "@/lib/zones";

// Same geocode/distance-matrix helpers as /api/quote and
// /api/corporate/book. Duplicated rather than shared so each route's
// pricing call stays self-contained and easy to audit on its own.
async function geocode(
  address: string
): Promise<{ lat: number; lng: number; formatted: string } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address + ", Louisiana"
  )}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status === "OK" && data.results?.length > 0) {
    const r = data.results[0];
    return {
      lat: r.geometry.location.lat,
      lng: r.geometry.location.lng,
      formatted: r.formatted_address || address,
    };
  }
  return null;
}

async function distanceMatrix(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<{ miles: number; minutes: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${origin.lat},${origin.lng}` +
    `&destinations=${dest.lat},${dest.lng}` +
    `&units=imperial&key=${key}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const el = data.rows?.[0]?.elements?.[0];
    if (data.status !== "OK" || el?.status !== "OK") return null;
    return { miles: el.distance.value / 1609.344, minutes: el.duration.value / 60 };
  } catch {
    return null;
  }
}

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
      paymentIntent,
      flightNumber,
    } = body;

    if (!name || !phone || !pickup || !dropoff) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // The fare is always re-derived here from the pricing engine, never
    // trusted from the client. Otherwise a POST straight to this route
    // (bypassing the booking form's /api/quote call) could set any
    // price, since that number also mints the Square Checkout link.
    let rate: number;
    let rateType: "hourly" | "airport" | "flat";
    let internalZone: string | null = null;
    let pickupLat: number | null = null;
    let pickupLng: number | null = null;
    let dropoffLat: number | null = null;
    let dropoffLng: number | null = null;
    let distanceMilesVal: number | null = null;

    if (serviceType === "hourly") {
      const day = new Date(date || Date.now()).getDay();
      const isWeekend = day === 0 || day === 5 || day === 6;
      const minHours = isWeekend ? HOURLY_MIN_WEEKEND : HOURLY_MIN_WEEKDAY;
      rate = HOURLY_RATE * minHours;
      rateType = "hourly";
    } else {
      const [pickupGeo, dropoffGeo] = await Promise.all([
        geocode(pickup),
        geocode(dropoff),
      ]);
      if (!pickupGeo || !dropoffGeo) {
        return NextResponse.json(
          { error: "Could not locate one or both addresses. Please check and try again." },
          { status: 400 }
        );
      }
      const dm = await distanceMatrix(pickupGeo, dropoffGeo);
      const drivingMiles = dm?.miles ?? haversineMiles(pickupGeo, dropoffGeo) * 1.15;
      const drivingMinutes = dm?.minutes ?? (drivingMiles / 45) * 60;

      const result = calculateRate(
        pickupGeo.lat,
        pickupGeo.lng,
        dropoffGeo.lat,
        dropoffGeo.lng,
        drivingMiles,
        drivingMinutes,
        pickupGeo.formatted,
        dropoffGeo.formatted
      );

      if (result.kind === "phone") {
        return NextResponse.json(
          { error: "This trip needs to be arranged by phone. Please call dispatch." },
          { status: 400 }
        );
      }

      rate = result.rate;
      rateType = result.isAirport ? "airport" : "flat";
      pickupLat = pickupGeo.lat;
      pickupLng = pickupGeo.lng;
      dropoffLat = dropoffGeo.lat;
      dropoffLng = dropoffGeo.lng;
      distanceMilesVal = Math.round(drivingMiles * 10) / 10;
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
      internal_zone: internalZone,
      rate,
      is_airport: rateType === "airport",
      distance_miles: distanceMilesVal,
      status: "pending",
      payment_intent: paymentIntent || "in-vehicle",
      paid: false,
      flight_number: flightNumber || null,
    };

    const { error } = await supabase.from("bookings").insert(row);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Mint a Square Checkout link for every priced booking, whatever the
    // payment choice. "Pay before" customers get it as the main button;
    // "pay in car" customers get it as an option in the email, and the
    // driver gets it on assignment so the fare can be settled from a
    // phone in the vehicle. Either way the webhook auto-marks the
    // booking paid the moment Square captures it.
    let paymentLink: string | null = null;
    if (rate && squareConfigured()) {
      const link = await createCheckoutLink({
        tripId,
        amountCents: Math.round(Number(rate) * 100),
        customerName: name,
        customerEmail: email || null,
        pickup,
        dropoff,
      });
      if (link) {
        paymentLink = link.url;
        // Best-effort store on the row so admin can resend if needed
        await supabase
          .from("bookings")
          .update({ payment_link: link.url, payment_link_id: link.id })
          .eq("trip_id", tripId)
          .then(
            () => undefined,
            () => undefined
          );
      }
    }

    // Await both side-effects before returning. Fire-and-forget doesn't
    // work on Vercel serverless — the runtime terminates the function as
    // soon as the response is sent and kills pending promises. Running
    // them in parallel keeps the user-facing delay to the slower of the
    // two (~1–2s for Gmail SMTP handshake).
    const intentLabel =
      paymentIntent === "online"
        ? paymentLink
          ? "Online link (Square) — sent"
          : "Online link (pending manual send)"
        : paymentIntent === "invoice"
          ? "Invoice"
          : paymentLink
            ? "In-vehicle (card, cash, or Square link)"
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
          flightNumber ? `Flight: ${flightNumber}` : "",
          `Pickup: ${tripDate} ${tripTime}`,
          `Fare: $${rate ?? "?"}`,
          `Pay: ${intentLabel}`,
          `Paid: no`,
        ]
          .filter(Boolean)
          .join("\n"),
        tags: "oncoming_automobile,sparkles",
        click: claimUrl(tripId),
        actions: [{ label: "Claim trip", url: claimUrl(tripId) }],
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
            flightNumber: flightNumber || null,
            paymentIntent: paymentIntent || "in-vehicle",
            paymentLink,
          })
        : Promise.resolve(),
      offerTripToDrivers(tripId).catch(() => {}),
    ]);

    return NextResponse.json({ ok: true, tripId });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Something went wrong";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
