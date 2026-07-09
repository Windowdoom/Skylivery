import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverHomeToken, driverHistoryUrl } from "@/lib/driverTrip";
import DriverTripCard from "@/components/admin/DriverTripCard";

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

  const sb = supabaseAdmin();
  const [{ data: driver }, { data: trip }] = await Promise.all([
    sb.from("drivers").select("name").eq("id", driverId).single(),
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
  ]);

  return (
    <main className="min-h-screen bg-navy p-5">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">
            {driver?.name ? `Hi ${driver.name.split(" ")[0]}` : "My current trip"}
          </h1>
        </div>

        {trip ? (
          <DriverTripCard booking={trip} />
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
          href={driverHistoryUrl(driverId)}
          className="block text-center mt-4 text-cream/50 text-xs hover:text-gold"
        >
          View my trip history
        </a>
      </div>
    </main>
  );
}
