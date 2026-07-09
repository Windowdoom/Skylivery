import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyClaimToken } from "@/lib/assign";
import ClaimForm from "@/components/admin/ClaimForm";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Claim trip | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

// Driver-facing claim page, opened from the "Claim trip" button on the
// new-booking ntfy push. The signed token in the URL authorizes the
// claim — drivers don't have dispatcher logins.

export default async function ClaimPage({
  params,
  searchParams,
}: {
  params: { tripId: string };
  searchParams: { t?: string };
}) {
  const tripId = decodeURIComponent(params.tripId);
  const token = searchParams.t || "";

  if (!verifyClaimToken(tripId, token)) {
    return <Shell title="Invalid link">This claim link is not valid. Ask dispatch to resend it.</Shell>;
  }

  const sb = supabaseAdmin();
  const [{ data: booking }, { data: drivers }, { data: vehicles }] =
    await Promise.all([
      sb
        .from("bookings")
        .select(
          "trip_id, status, customer_name, pickup_address, dropoff_address, trip_date, trip_time, rate, passengers, flight_number, paid, payment_intent, drivers(name)"
        )
        .eq("trip_id", tripId)
        .single(),
      sb.from("drivers").select("id, name, primary_vehicle").eq("active", true).order("name"),
      sb.from("vehicles").select("id, cpnc_number, make, model").eq("active", true).order("cpnc_number"),
    ]);

  if (!booking) {
    return <Shell title="Trip not found">Reference {tripId} isn&apos;t in the system.</Shell>;
  }

  if (booking.status !== "pending") {
    const takenBy = (booking.drivers as unknown as { name?: string } | null)?.name;
    return (
      <Shell title={booking.status === "assigned" ? "Already claimed" : `Trip ${booking.status}`}>
        {booking.status === "assigned"
          ? `${takenBy ? `${takenBy} has` : "Another driver has"} this one. Next trip is yours.`
          : `This trip is marked ${booking.status}.`}
      </Shell>
    );
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">Claim this trip</h1>
        </div>

        <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold">{booking.trip_id}</span>
            <span className="text-gold font-semibold">${booking.rate ?? "?"}</span>
          </div>
          <div className="text-cream font-medium">{booking.customer_name}</div>
          <div className="mt-2 text-cream/80 text-xs leading-snug">
            <div>↑ {booking.pickup_address}</div>
            <div>↓ {booking.dropoff_address}</div>
          </div>
          <div className="mt-2 text-cream/60 text-xs">
            {booking.trip_date} · {booking.trip_time}
            {booking.passengers ? ` · ${booking.passengers} pax` : ""}
            {booking.flight_number ? ` · ✈ ${booking.flight_number}` : ""}
          </div>
          <div className="mt-2 text-xs">
            {booking.paid ? (
              <span className="text-emerald-300">PAID — nothing to collect</span>
            ) : booking.payment_intent === "in-vehicle" ? (
              <span className="text-yellow-300">Collect ${booking.rate ?? "?"} in the car</span>
            ) : (
              <span className="text-cream/60">Payment pending online</span>
            )}
          </div>

          <ClaimForm
            tripId={booking.trip_id}
            token={token}
            drivers={(drivers ?? []) as { id: string; name: string; primary_vehicle: string | null }[]}
            vehicles={(vehicles ?? []) as { id: string; cpnc_number: string; make: string | null; model: string | null }[]}
          />
        </div>
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
