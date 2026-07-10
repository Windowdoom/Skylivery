import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverHomeToken, driverHistoryUrl, driverEarningsUrl, driverHomeUrl } from "@/lib/driverTrip";
import DriverTripCard from "@/components/admin/DriverTripCard";
import AutoRefresh from "@/components/AutoRefresh";
import LocationReporter from "@/components/LocationReporter";
import DriverConfigError from "@/components/DriverConfigError";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata = {
  title: "My trip | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

// The driver's persistent home base — bookmark or add-to-home-screen
// once, and it always shows whatever's currently assigned, no need to
// wait on (or trust) a push notification actually showing up. This is
// the fallback for cases like Android silently swallowing a push due
// to battery optimization or a blocked notification permission.

export default async function DriverHomePage({
  searchParams,
}: {
  searchParams: { d?: string; t?: string };
}) {
  const driverId = searchParams.d || "";
  const token = searchParams.t || "";

  if (!driverId || !verifyDriverHomeToken(driverId, token)) {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <div className="max-w-sm text-center">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mb-3">Invalid link</h1>
          <p className="text-cream/70 text-sm">Ask dispatch to resend your setup link.</p>
        </div>
      </main>
    );
  }

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return <DriverConfigError />;
  }
  const [{ data: driver }, { data: trip }, { data: weekTrips }] = await Promise.all([
    sb.from("drivers").select("name, payout_percent").eq("id", driverId).single(),
    sb
      .from("bookings")
      .select(
        "trip_id, customer_name, customer_phone, pickup_address, dropoff_address, trip_date, trip_time, rate, paid, payment_method, payment_link, flight_number, assigned_at"
      )
      .eq("assigned_driver", driverId)
      .eq("status", "assigned")
      .order("assigned_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    sb
      .from("bookings")
      .select("rate, completed_at")
      .eq("assigned_driver", driverId)
      .eq("status", "completed")
      .gte("completed_at", weekStart.toISOString()),
  ]);

  const percent = driver?.payout_percent ?? 92;
  const weekRows = weekTrips ?? [];
  const todayRows = weekRows.filter((r) => r.completed_at && new Date(r.completed_at) >= todayStart);
  const weekGross = weekRows.reduce((s, r) => s + (r.rate ?? 0), 0);
  const todayGross = todayRows.reduce((s, r) => s + (r.rate ?? 0), 0);
  const weekPayout = Math.round(weekGross * (percent / 100) * 100) / 100;
  const todayPayout = Math.round(todayGross * (percent / 100) * 100) / 100;

  return (
    <main className="min-h-screen bg-navy p-5">
      <AutoRefresh />
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">
            {driver?.name ? `Hi ${driver.name.split(" ")[0]}` : "My current trip"}
          </h1>
        </div>

        <a
          href={driverEarningsUrl(driverId)}
          className="grid grid-cols-2 gap-2 mb-5 hover:opacity-90"
        >
          <div className="bg-navy/70 border border-gold/25 rounded-xl p-3 text-center">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">Today</div>
            <div className="text-cream font-display text-lg mt-0.5">${todayPayout.toFixed(0)}</div>
            <div className="text-cream/40 text-[10px]">{todayRows.length} trip{todayRows.length === 1 ? "" : "s"}</div>
          </div>
          <div className="bg-navy/70 border border-gold/25 rounded-xl p-3 text-center">
            <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">This week</div>
            <div className="text-cream font-display text-lg mt-0.5">${weekPayout.toFixed(0)}</div>
            <div className="text-cream/40 text-[10px]">{weekRows.length} trip{weekRows.length === 1 ? "" : "s"}</div>
          </div>
        </a>

        {trip ? (
          <>
            <DriverTripCard booking={trip} callbackUrl={driverHomeUrl(driverId)} />
            <LocationReporter driverId={driverId} token={token} />
          </>
        ) : (
          <div className="bg-navy/70 border border-gold/25 rounded-2xl p-6 text-center">
            <p className="text-cream/70 text-sm">No active trip right now.</p>
            <p className="text-cream/50 text-xs mt-2">
              You&apos;ll get a notification the moment a new trip comes in. If you don&apos;t see it, check back
              here, it&apos;s always up to date.
            </p>
          </div>
        )}

        <a
          href={driverEarningsUrl(driverId)}
          className="block text-center mt-4 text-cream/70 text-xs hover:text-gold"
        >
          View my earnings
        </a>
        <a
          href={driverHistoryUrl(driverId)}
          className="block text-center mt-2 text-cream/50 text-xs hover:text-gold"
        >
          View my trip history
        </a>
      </div>
    </main>
  );
}
