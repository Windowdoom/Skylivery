import { NextRequest, NextResponse } from "next/server";
import {
  calculateRate,
  distanceMiles,
  HOURLY_RATE,
  HOURLY_MIN_WEEKDAY,
  HOURLY_MIN_WEEKEND,
} from "@/lib/zones";

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
    const meters = el.distance.value;
    const seconds = el.duration.value;
    return {
      miles: meters / 1609.344,
      minutes: seconds / 60,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup, dropoff, serviceType, date } = body;

    if (!pickup || !dropoff) {
      return NextResponse.json(
        { error: "Pickup and dropoff addresses are required" },
        { status: 400 }
      );
    }

    if (serviceType === "hourly") {
      const day = new Date(date || Date.now()).getDay();
      const isWeekend = day === 0 || day === 5 || day === 6;
      const minHours = isWeekend ? HOURLY_MIN_WEEKEND : HOURLY_MIN_WEEKDAY;
      return NextResponse.json({
        rate: HOURLY_RATE,
        rateType: "hourly",
        minimumHours: minHours,
        minimumTotal: HOURLY_RATE * minHours,
        note: `$${HOURLY_RATE}/hr · ${minHours}-hour minimum · gratuity included`,
      });
    }

    const [pickupGeo, dropoffGeo] = await Promise.all([
      geocode(pickup),
      geocode(dropoff),
    ]);

    if (!pickupGeo || !dropoffGeo) {
      return NextResponse.json(
        {
          error:
            "Could not locate one or both addresses. Please check and try again.",
        },
        { status: 400 }
      );
    }

    // Actual driving distance + duration from Google. Fall back to
    // haversine + 15% buffer if the Distance Matrix call fails so we
    // never leave the customer without a quote.
    const dm = await distanceMatrix(pickupGeo, dropoffGeo);
    const drivingMiles =
      dm?.miles ??
      distanceMiles(pickupGeo, dropoffGeo) * 1.15;
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
      return NextResponse.json({
        rateType: "phone",
        note: "Please call dispatch to arrange this trip.",
        phone: "(504) 339-6861",
        reason: result.reason,
        distanceMiles: Math.round(drivingMiles * 10) / 10,
      });
    }

    const { rate, isAirport, breakdown } = result;

    let note: string;
    if (isAirport && breakdown.perMileTotal > 0) {
      note = `$${rate} all-inclusive MSY transfer, gratuity included`;
    } else if (isAirport) {
      note = `$${rate} flat-rate MSY transfer, gratuity included`;
    } else {
      note = `$${rate} flat rate, gratuity included, no surge`;
    }

    return NextResponse.json({
      rate,
      rateType: isAirport ? "airport" : "flat",
      note,
      pickupLat: pickupGeo.lat,
      pickupLng: pickupGeo.lng,
      dropoffLat: dropoffGeo.lat,
      dropoffLng: dropoffGeo.lng,
      distanceMiles: Math.round(drivingMiles * 10) / 10,
    });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please call to book." },
      { status: 500 }
    );
  }
}
