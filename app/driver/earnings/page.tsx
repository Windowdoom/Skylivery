import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverEarningsToken, driverHomeUrl, driverHistoryUrl } from "@/lib/driverTrip";
import DriverConfigError from "@/components/DriverConfigError";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata = {
  title: "My earnings | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}
function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function money(n: number): string {
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

export default async function DriverEarningsPage({
  searchParams,
}: {
  searchParams: { d?: string; t?: string };
}) {
  const driverId = searchParams.d || "";
  const token = searchParams.t || "";

  if (!driverId || !verifyDriverEarningsToken(driverId, token)) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mb-3">Invalid link</h1>
          <p className="text-cream/70 text-sm">Ask dispatch to resend your earnings link.</p>
        </div>
      </main>
    );
  }

  const weekStart = startOfWeek();
  const todayStart = startOfToday();

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return <DriverConfigError />;
  }
  const [{ data: driver }, { data: weekTrips }] = await Promise.all([
    sb.from("drivers").select("name, payout_percent").eq("id", driverId).single(),
    sb
      .from("bookings")
      .select("trip_id, rate, completed_at, dropoff_address")
      .eq("assigned_driver", driverId)
      .eq("status", "completed")
      .gte("completed_at", weekStart.toISOString())
      .order("completed_at", { ascending: false }),
  ]);

  const percent = driver?.payout_percent ?? 92;
  const weekRows = weekTrips ?? [];
  const todayRows = weekRows.filter((r) => r.completed_at && new Date(r.completed_at) >= todayStart);

  const weekGross = weekRows.reduce((s, r) => s + (r.rate ?? 0), 0);
  const todayGross = todayRows.reduce((s, r) => s + (r.rate ?? 0), 0);
  const weekPayout = Math.round(weekGross * (percent / 100) * 100) / 100;
  const todayPayout = Math.round(todayGross * (percent / 100) * 100) / 100;
  const avgPerTrip = weekRows.length > 0 ? weekPayout / weekRows.length : 0;

  return (
    <main className="min-h-screen bg-navy p-5">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">
            {driver?.name ? `${driver.name.split(" ")[0]}'s earnings` : "My earnings"}
          </h1>
          <p className="text-cream/50 text-xs mt-2">Payout rate: {percent}% of fare</p>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="bg-navy/70 border border-gold/25 rounded-xl p-4 text-center">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">Today</div>
            <div className="text-cream font-display text-2xl mt-1">{money(todayPayout)}</div>
            <div className="text-cream/40 text-[10px] mt-0.5">
              {todayRows.length} trip{todayRows.length === 1 ? "" : "s"} · {money(todayGross)} gross
            </div>
          </div>
          <div className="bg-navy/70 border border-gold/25 rounded-xl p-4 text-center">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">This week</div>
            <div className="text-cream font-display text-2xl mt-1">{money(weekPayout)}</div>
            <div className="text-cream/40 text-[10px] mt-0.5">
              {weekRows.length} trip{weekRows.length === 1 ? "" : "s"} · {money(weekGross)} gross
            </div>
          </div>
        </div>

        <div className="bg-navy/70 border border-gold/25 rounded-xl p-4 text-center mb-5">
          <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">Average per trip, this week</div>
          <div className="text-cream font-display text-xl mt-1">{money(avgPerTrip)}</div>
        </div>

        <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70 mb-2 mt-6">This week&apos;s trips</div>
        <div className="space-y-2">
          {weekRows.length === 0 ? (
            <p className="text-cream/50 text-sm text-center py-6">No completed trips yet this week.</p>
          ) : (
            weekRows.map((r) => (
              <div key={r.trip_id} className="bg-navy/70 border border-gold/25 rounded-xl p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.2em] uppercase text-gold">{r.trip_id}</span>
                  <span className="text-gold font-semibold">
                    {money(Math.round((r.rate ?? 0) * (percent / 100) * 100) / 100)}
                  </span>
                </div>
                <div className="text-cream/60 text-xs mt-1">↓ {r.dropoff_address}</div>
                <div className="text-cream/40 text-[10px] mt-1">
                  {r.completed_at
                    ? new Date(r.completed_at).toLocaleDateString("en-US", {
                        weekday: "short",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            ))
          )}
        </div>

        <a
          href={driverHomeUrl(driverId)}
          className="block text-center mt-6 text-cream text-sm font-semibold hover:text-gold"
        >
          My current trip
        </a>
        <a
          href={driverHistoryUrl(driverId)}
          className="block text-center mt-2 text-cream/50 text-xs hover:text-gold"
        >
          View full trip history
        </a>
      </div>
    </main>
  );
}
