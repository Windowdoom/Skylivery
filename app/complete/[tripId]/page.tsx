import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyCompleteToken } from "@/lib/complete";
import CompleteForm from "@/components/admin/CompleteForm";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const metadata = {
  title: "Complete trip | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

// Driver-facing "trip's done" page, opened from the link texted to
// them on assignment. Signed token authorizes it — private SMS, so no
// PIN needed (unlike the shared-ntfy claim link).

export default async function CompletePage({
  params,
  searchParams,
}: {
  params: { tripId: string };
  searchParams: { t?: string };
}) {
  const tripId = decodeURIComponent(params.tripId);
  const token = searchParams.t || "";

  if (!verifyCompleteToken(tripId, token)) {
    return <Shell title="Invalid link">This link is not valid. Ask dispatch to resend it.</Shell>;
  }

  const sb = supabaseAdmin();
  const { data: booking } = await sb
    .from("bookings")
    .select(
      "trip_id, status, customer_name, dropoff_address, rate, paid, payment_method"
    )
    .eq("trip_id", tripId)
    .single();

  if (!booking) {
    return <Shell title="Trip not found">Reference {tripId} isn&apos;t in the system.</Shell>;
  }

  if (booking.status === "completed") {
    return <Shell title="Already closed out">This trip is already marked complete. Nice work.</Shell>;
  }
  if (booking.status === "cancelled") {
    return <Shell title="Trip cancelled">This trip was cancelled, nothing to complete.</Shell>;
  }
  if (booking.status !== "assigned") {
    return <Shell title="Not ready yet">This trip hasn&apos;t been assigned yet.</Shell>;
  }

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">Trip complete?</h1>
        </div>

        <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5 text-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] tracking-[0.25em] uppercase text-gold">{booking.trip_id}</span>
            <span className="text-gold font-semibold">${booking.rate ?? "?"}</span>
          </div>
          <div className="text-cream font-medium">{booking.customer_name}</div>
          <div className="mt-1 text-cream/60 text-xs">↓ {booking.dropoff_address}</div>

          <CompleteForm
            tripId={booking.trip_id}
            token={token}
            alreadyPaid={booking.paid === true}
            paidMethod={booking.payment_method}
            rate={booking.rate}
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
