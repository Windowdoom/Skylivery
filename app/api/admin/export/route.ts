import { NextRequest, NextResponse } from "next/server";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  if (!isAuthed()) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const scope = req.nextUrl.searchParams.get("scope") || "month";
  const sb = supabaseAdmin();

  const now = new Date();
  let from: string;
  const to = now.toISOString().slice(0, 10);
  if (scope === "year") {
    from = new Date(now.getFullYear(), 0, 1).toISOString().slice(0, 10);
  } else if (scope === "quarter") {
    const q = Math.floor(now.getMonth() / 3) * 3;
    from = new Date(now.getFullYear(), q, 1).toISOString().slice(0, 10);
  } else {
    from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  }

  // Pull straight from bookings (joined to drivers/vehicles) instead of
  // the trip_log view. trip_log's own definition was never captured in
  // the repo (see supabase/schema.sql) and empty exports suggest it was
  // either never created correctly or has drifted from what bookings
  // actually looks like. Querying bookings directly is the source of
  // truth and removes that dependency entirely.
  const { data, error } = await sb
    .from("bookings")
    .select(
      "trip_id, trip_date, trip_time, pickup_address, dropoff_address, distance_miles, rate, payment_method, service_type, customer_name, card_last4, drivers(name, gtb_permit_id), vehicles(cpnc_number)"
    )
    .eq("status", "completed")
    .gte("trip_date", from)
    .lte("trip_date", to)
    .order("trip_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const headers = [
    "trip_id", "trip_date", "trip_time",
    "driver_name", "driver_gtb_permit",
    "pickup_address", "dropoff_address", "distance_miles",
    "fare_charges", "payment_method", "card_last4",
    "cpnc_number", "customer_name", "company_name",
  ];

  const rows = (data ?? []).map((r) => {
    const driver = r.drivers as unknown as { name?: string; gtb_permit_id?: string } | null;
    const vehicle = r.vehicles as unknown as { cpnc_number?: string } | null;
    // Corporate bookings store "Contact Name · Company Name" in
    // customer_name (see app/api/corporate/book/route.ts) — split it
    // back out for the export so accounting can filter by company.
    const isCorporate = (r.service_type || "").toLowerCase() === "corporate";
    const name = r.customer_name || "";
    const [contactName, companyName] =
      isCorporate && name.includes(" · ") ? name.split(" · ") : [name, ""];
    return {
      trip_id: r.trip_id,
      trip_date: r.trip_date,
      trip_time: r.trip_time,
      driver_name: driver?.name ?? "",
      driver_gtb_permit: driver?.gtb_permit_id ?? "",
      pickup_address: r.pickup_address,
      dropoff_address: r.dropoff_address,
      distance_miles: r.distance_miles,
      fare_charges: r.rate,
      payment_method: r.payment_method ?? "",
      card_last4: r.card_last4 ?? "",
      cpnc_number: vehicle?.cpnc_number ?? "",
      customer_name: contactName,
      company_name: companyName,
    };
  });

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => csvCell((r as Record<string, unknown>)[h])).join(",")),
  ];
  const body = lines.join("\n") + "\n";

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="skylivery-${scope}-${to}.csv"`,
    },
  });
}
