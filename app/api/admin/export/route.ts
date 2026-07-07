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

  const { data, error } = await sb
    .from("trip_log")
    .select("*")
    .gte("trip_date", from)
    .lte("trip_date", to)
    .order("trip_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const headers = [
    "trip_id", "trip_date", "trip_time",
    "driver_name", "driver_gtb_permit",
    "pickup_address", "dropoff_address", "distance_miles",
    "fare_charges", "extra_charges", "total_charges", "payment_method",
    "cpnc_number", "company_name",
  ];
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
