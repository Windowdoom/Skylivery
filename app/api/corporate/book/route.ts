import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sendBookingConfirmation } from "@/lib/email";
import { ntfyPush } from "@/lib/ntfy";
import { createCorporateInvoice, squareConfigured } from "@/lib/square";
import { calculateRate, distanceMiles } from "@/lib/zones";
import { claimUrl } from "@/lib/assign";
import { offerTripToDrivers } from "@/lib/driverOffers";

async function geocode(
  address: string
): Promise<{ lat: number; lng: number; formatted: string } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address + ", Louisiana"
  )}&key=${key}`;
  try {
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
  } catch {}
  return null;
}

async function distanceMatrix(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number }
): Promise<{ miles: number; minutes: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;
  try {
    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?` +
      `origins=${origin.lat},${origin.lng}` +
      `&destinations=${dest.lat},${dest.lng}` +
      `&units=imperial&key=${key}`;
    const res = await fetch(url);
    const data = await res.json();
    const el = data.rows?.[0]?.elements?.[0];
    if (data.status !== "OK" || el?.status !== "OK") return null;
    return {
      miles: el.distance.value / 1609.344,
      minutes: el.duration.value / 60,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyName,
      contactName,
      contactTitle,
      phone,
      email,
      billingAddress,
      taxId,
      poNumber,
      costCenter,
      terms,
      pickup,
      dropoff,
      date,
      time,
      passengers,
      passenger,
      notes,
    } = body;

    if (!companyName || !contactName || !phone || !email || !pickup || !dropoff || !date || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Supabase client (anon insert)
    const url =
      process.env.NEXT_PUBLIC_SUPABASE_URL ||
      process.env.SUPABASE_URL ||
      "";
    if (!url) {
      return NextResponse.json(
        { error: "Booking service not configured. Please call to book." },
        { status: 500 }
      );
    }

    // Use service key to write corporate bookings (contains sensitive
    // company data we don't want anon-writable).
    const sb = supabaseAdmin();

    // Trip reference
    const year = new Date().getFullYear();
    const suffix = Array.from({ length: 5 }, () =>
      "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32))
    ).join("");
    const tripId = `SL-${year}-${suffix}`;

    // Quote the fare
    const [pickupGeo, dropoffGeo] = await Promise.all([
      geocode(pickup),
      geocode(dropoff),
    ]);
    if (!pickupGeo || !dropoffGeo) {
      return NextResponse.json(
        { error: "Could not locate one or both addresses." },
        { status: 400 }
      );
    }
    const dm = await distanceMatrix(pickupGeo, dropoffGeo);
    const drivingMiles = dm?.miles ?? distanceMiles(pickupGeo, dropoffGeo) * 1.15;
    const drivingMinutes = dm?.minutes ?? (drivingMiles / 45) * 60;

    const rateResult = calculateRate(
      pickupGeo.lat,
      pickupGeo.lng,
      dropoffGeo.lat,
      dropoffGeo.lng,
      drivingMiles,
      drivingMinutes,
      pickupGeo.formatted,
      dropoffGeo.formatted
    );

    if (rateResult.kind === "phone") {
      // Long trip — still insert as corporate but rate=0, dispatch quotes
      // manually before publishing invoice.
      const row = {
        trip_id: tripId,
        customer_name: `${contactName} · ${companyName}`,
        customer_phone: phone,
        customer_email: email,
        pickup_address: pickup,
        dropoff_address: dropoff,
        trip_date: date,
        trip_time: time,
        service_type: "corporate",
        passengers: Number(passengers) || 1,
        rate: 0,
        distance_miles: Math.round(drivingMiles * 10) / 10,
        status: "pending",
        payment_intent: "invoice",
        paid: false,
        dispatched_by: "Corporate portal",
      };
      await sb.from("bookings").insert(row);
      await ntfyPush({
        title: `Corporate booking (call to quote) · ${tripId}`,
        body: [
          `${companyName}`,
          `${contactName}${contactTitle ? " · " + contactTitle : ""}`,
          `${phone} · ${email}`,
          ``,
          `↑ ${pickup}`,
          `↓ ${dropoff}`,
          `${date} ${time}`,
          `Terms: ${terms}`,
          poNumber ? `PO: ${poNumber}` : "",
          notes ? `Notes: ${notes}` : "",
          `Long trip — dispatch to quote and manually invoice.`,
        ]
          .filter(Boolean)
          .join("\n"),
        tags: "briefcase,phone,warning",
      });
      return NextResponse.json({ ok: true, tripId, phoneQuote: true });
    }

    const fare = rateResult.rate;

    const row = {
      trip_id: tripId,
      customer_name: `${contactName} · ${companyName}`,
      customer_phone: phone,
      customer_email: email,
      pickup_address: pickup,
      dropoff_address: dropoff,
      pickup_lat: pickupGeo.lat,
      pickup_lng: pickupGeo.lng,
      dropoff_lat: dropoffGeo.lat,
      dropoff_lng: dropoffGeo.lng,
      trip_date: date,
      trip_time: time,
      service_type: "corporate",
      passengers: Number(passengers) || 1,
      rate: fare,
      is_airport: rateResult.isAirport,
      distance_miles: Math.round(drivingMiles * 10) / 10,
      status: "pending",
      payment_intent: "invoice",
      paid: false,
      dispatched_by: "Corporate portal",
    };

    const { error } = await sb.from("bookings").insert(row);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create the Square invoice (if configured)
    let invoiceUrl: string | null = null;
    let invoiceId: string | null = null;
    if (squareConfigured()) {
      const inv = await createCorporateInvoice({
        tripId,
        amountCents: Math.round(fare * 100),
        companyName,
        contactName,
        contactEmail: email,
        contactPhone: phone,
        billingAddress,
        pickup,
        dropoff,
        tripDate: date,
        tripTime: time,
        terms: terms || "Net 30",
        poNumber,
        costCenter,
      });
      if (inv) {
        invoiceUrl = inv.url;
        invoiceId = inv.id;
        await sb
          .from("bookings")
          .update({ payment_link: invoiceUrl, payment_link_id: invoiceId })
          .eq("trip_id", tripId)
          .then(() => undefined, () => undefined);
      }
    }

    await Promise.allSettled([
      ntfyPush({
        title: `Corporate booking · ${companyName}`,
        body: [
          `${tripId}`,
          `${companyName}`,
          `${contactName}${contactTitle ? " · " + contactTitle : ""}`,
          `${phone}`,
          `${email}`,
          billingAddress ? `Billing: ${billingAddress}` : "",
          taxId ? `Tax ID: ${taxId}` : "",
          poNumber ? `PO: ${poNumber}` : "",
          costCenter ? `Cost: ${costCenter}` : "",
          `Terms: ${terms}`,
          ``,
          `↑ ${pickup}`,
          `↓ ${dropoff}`,
          passenger ? `Passenger: ${passenger}` : "",
          `Pickup: ${date} ${time}`,
          `Fare: $${fare}`,
          invoiceUrl ? `Invoice sent via Square` : `Invoice: NOT sent (manual)`,
          notes ? `Notes: ${notes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        tags: "briefcase,receipt,sparkles",
        click: claimUrl(tripId),
        actions: [{ label: "Claim trip", url: claimUrl(tripId) }],
      }),
      email
        ? sendBookingConfirmation({
            to: email,
            customerName: contactName,
            tripId,
            pickup,
            dropoff,
            tripDate: date,
            tripTime: time,
            rate: fare,
            passengers: Number(passengers) || 1,
            serviceType: "corporate",
            paymentIntent: "invoice",
            paymentLink: invoiceUrl,
          })
        : Promise.resolve(),
      offerTripToDrivers(tripId).catch(() => {}),
    ]);

    return NextResponse.json({ ok: true, tripId, invoiceUrl });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
