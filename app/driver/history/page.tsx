import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverHistoryToken } from "@/lib/driverTrip";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "My trips | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

export default async function DriverHistoryPage({
  searchParams,
}: {
  searchParams: { d?: string; t?: string };
}) {
  const driverId = searchParams.d || "";
  const token = searchParams.t || "";

  if (!driverId || !verifyDriverHistoryToken(driverId, token)) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mb-3">Invalid link</h1>
          <p className="text-cream/70 text-sm">Ask dispatch to resend your history link.</p>
        </div>
      </main>
    );
  }

  const sb = supabaseAdmin();
  const [{ data: driver }, { data: trips }] = await Promise.all([
    sb.from("drivers").select("name").eq("id", driverId).single(),
    sb
      .from("bookings")
      .select("trip_id, customer_name, dropoff_address, rate, payment_method, completed_at")
      .eq("assigned_driver", driverId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(50),
  ]);

  const rows = trips ?? [];
  const totalEarned = rows.reduce((sum, r) => sum + (r.rate ?? 0), 0);

  return (
    <main className="min-h-screen bg-navy p-5">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">
            {driver?.name ? `${driver.name}'s trips` : "My trips"}
          </h1>
          <p className="text-cream/60 text-xs mt-2">
            {rows.length} completed · ${totalEarned.toLocaleString()} total fares
          </p>
        </div>

        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-cream/50 text-sm text-center py-8">No completed trips yet.</p>
          ) : (
            rows.map((r) => (
              <div
                key={r.trip_id}
                className="bg-navy/70 border border-gold/25 rounded-xl p-4 text-sm"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-gold">{r.trip_id}</span>
                  <span className="text-gold font-semibold">${r.rate ?? "?"}</span>
                </div>
                <div className="text-cream">{r.customer_name}</div>
                <div className="text-cream/60 text-xs mt-1">↓ {r.dropoff_address}</div>
                <div className="text-cream/50 text-[10px] mt-1">
                  {r.completed_at
                    ? new Date(r.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ""}
                  {r.payment_method ? ` · ${r.payment_method}` : ""}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
