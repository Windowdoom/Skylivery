import { NextRequest, NextResponse } from "next/server";
import { calculateRate, HOURLY_RATE, HOURLY_MIN_WEEKDAY, HOURLY_MIN_WEEKEND } from "@/lib/zones";

async function geocode(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) return null;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${key}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status === "OK" && data.results.length > 0) {
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup, dropoff, serviceType } = body;

    if (!pickup || !dropoff) {
      return NextResponse.json({ error: "Pickup and dropoff addresses are required" }, { status: 400 });
    }

    if (serviceType === "hourly") {
      const date = new Date(body.date || Date.now());
      const day = date.getDay();
      const isWeekend = day === 0 || day === 5 || day === 6;
      const minHours = isWeekend ? HOURLY_MIN_WEEKEND : HOURLY_MIN_WEEKDAY;
      return NextResponse.json({
        rate: HOURLY_RATE,
        rateType: "hourly",
        minimumHours: minHours,
        minimumTotal: HOURLY_RATE * minHours,
        note: `$${HOURLY_RATE}/hr, ${minHours}-hour minimum, gratuity included`,
      });
    }

    const pickupCoords = await geocode(pickup);
    const dropoffCoords = await geocode(dropoff);

    if (!pickupCoords || !dropoffCoords) {
      return NextResponse.json({ error: "Could not locate one or both addresses" }, { status: 400 });
    }

    const { rate, isAirport } = calculateRate(
      pickupCoords.lat, pickupCoords.lng,
      dropoffCoords.lat, dropoffCoords.lng
    );

    return NextResponse.json({
      rate,
      rateType: isAirport ? "airport" : "flat",
      note: isAirport
        ? `$${rate} flat rate airport transfer, gratuity included`
        : `$${rate} flat rate, gratuity included`,
    });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
