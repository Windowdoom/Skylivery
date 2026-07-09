import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyDriverTripToken, driverHistoryUrl } from "@/lib/driverTrip";
import { completeToken } from "@/lib/complete";
import { mapsDirectionsUrl } from "@/lib/maps";
import DriverClaimButton from "@/components/admin/DriverClaimButton";
import CompleteForm from "@/components/admin/CompleteForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Your trip | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

// The driver's one-stop page for a trip, reached by tapping a web push
// notification. Handles the whole lifecycle from one URL: claim it
// (if still pending), then navigate/pay/text-customer/complete it
// (once assigned to this driver) — no PIN needed since push
// notifications are per-device, not a shared channel like ntfy.

export default async function DriverTripPage({
  params,
  searchParams,
}: {
  params: { tripId: string };
  searchParams: { d?: string; t?: string };
}) {
  const tripId = decodeURIComponent(params.tripId);
  const driverId = searchParams.d || "";
  const token = searchParams.t || "";

  if (!driverId || !verifyDriverTripToken(tripId, driverId, token)) {
    return <Shell title="Invalid link">This link isn&apos;t valid. Ask dispatch to resend it.</Shell>;
  }

  const sb = supabaseAdmin();
  const [{ data: booking }, { data: driver }] = await Promise.all([
    sb
      .from("bookings")
      .select(
        "trip_id, status, assigned_driver, customer_name, customer_phone, pickup_address, dropoff_address, trip_date, trip_time, rate, paid, payment_method, payment_intent, payment_link, flight_number"
      )
      .eq("trip_id", tripId)
      .single(),
    sb.from("drivers").select("id, name, primary_vehicle").eq("id", driverId).eq("active", true).single(),
  ]);

  if (!booking) {
    return <Shell title="Trip not found">Reference {tripId} isn&apos;t in the system.</Shell>;
  }
  if (!driver) {
    return <Shell title="Driver not found">Ask dispatch to check your account.</Shell>;
  }
  if (booking.status === "cancelled") {
    return <Shell title="Trip cancelled">This trip was cancelled, nothing to do here.</Shell>;
  }

  // Still open — show the claim screen.
  if (booking.status === "pending") {
    return (
      <main className="min-h-screen bg-navy flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
            <h1 className="font-display text-2xl text-cream mt-1">New trip</h1>
          </div>
          <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5 text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] tracking-[0.25em] uppercase text-gold">{booking.trip_id}</span>
              <span className="text-gold font-semibold">${booking.rate ?? "?"}</span>
            </div>
            <div className="mt-1 text-cream/80 text-xs leading-snug">
              <div>↑ {booking.pickup_address}</div>
              <div>↓ {booking.dropoff_address}</div>
            </div>
            <div className="mt-2 text-cream/60 text-xs">
              {booking.trip_date} · {booking.trip_time}
              {booking.flight_number ? ` · ✈ ${booking.flight_number}` : ""}
            </div>
            <DriverClaimButton tripId={tripId} driverId={driverId} token={token} vehicleId={driver.primary_vehicle} />
          </div>
        </div>
      </main>
    );
  }

  // Assigned to someone else.
  if (booking.status === "assigned" && booking.assigned_driver !== driverId) {
    return <Shell title="Already claimed">Another driver already has this one. The next trip is yours.</Shell>;
  }

  if (booking.status === "completed") {
    return <Shell title="Already closed out">This trip is already marked complete. Nice work.</Shell>;
  }

  // Assigned to this driver — full trip hub.
  const smsBody = `Hi ${booking.customer_name.split(" ")[0]}, this is your Sky Livery driver. On the way.`;
  const textCustomerHref = `sms:${booking.customer_phone.replace(/[^\d+]/g, "")}?&body=${encodeURIComponent(smsBody)}`;

  return (
    <main className="min-h-screen bg-navy p-5">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6 mt-4">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">Your trip</h1>
        </div>

        <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5 text-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold">{booking.trip_id}</span>
            <span className="text-gold font-semibold">${booking.rate ?? "?"}</span>
          </div>

          <div>
            <div className="text-cream font-medium">{booking.customer_name}</div>
            <a href={`tel:${booking.customer_phone}`} className="text-cream/70 text-xs hover:text-gold">
              {booking.customer_phone}
            </a>
          </div>

          <div className="space-y-2">
            <a
              href={mapsDirectionsUrl(booking.pickup_address)}
              target="_blank"
              className="block bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 hover:border-gold"
            >
              <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">Pickup, tap to navigate</div>
              <div className="text-cream text-xs mt-0.5">{booking.pickup_address}</div>
            </a>
            <a
              href={mapsDirectionsUrl(booking.dropoff_address)}
              target="_blank"
              className="block bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 hover:border-gold"
            >
              <div className="text-[9px] tracking-[0.2em] uppercase text-gold/70">Dropoff, tap to navigate</div>
              <div className="text-cream text-xs mt-0.5">{booking.dropoff_address}</div>
            </a>
          </div>

          <div className="text-cream/60 text-xs">
            {booking.trip_date} · {booking.trip_time}
            {booking.flight_number ? ` · ✈ ${booking.flight_number}` : ""}
          </div>

          {!booking.paid && booking.payment_link && (
            <a
              href={booking.payment_link}
              target="_blank"
              className="block text-center py-2.5 bg-navy border border-gold/50 text-gold rounded-lg font-semibold hover:bg-gold/10"
            >
              Tap to charge ${booking.rate ?? "?"}
            </a>
          )}
          {booking.paid && (
            <div className="text-emerald-300 text-xs bg-emerald-400/10 border border-emerald-400/30 rounded-md px-3 py-2">
              Paid via {booking.payment_method === "square" ? "Square" : booking.payment_method || "card"}. Nothing to collect.
            </div>
          )}

          <a
            href={textCustomerHref}
            className="block text-center py-2.5 border border-gold/30 text-cream/80 rounded-lg text-sm hover:border-gold hover:text-gold"
          >
            Text customer
          </a>

          <div className="pt-2 border-t border-gold/15">
            <p className="text-cream/60 text-[10px] tracking-[0.2em] uppercase mb-1">When the ride's done</p>
            <CompleteForm
              tripId={booking.trip_id}
              token={completeToken(booking.trip_id)}
              alreadyPaid={booking.paid === true}
              paidMethod={booking.payment_method}
              rate={booking.rate}
            />
          </div>
        </div>
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

function Shell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="max-w-sm text-center">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Sky Livery dispatch</div>
        <h1 className="font-display text-2xl text-cream mb-3">{title}</h1>
        <p className="text-cream/70 text-sm">{children}</p>
      </div>
    </main>
  );
}
