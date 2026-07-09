import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur, { FleurIcon } from "@/components/Fleur";
import TicketRef from "@/components/TicketRef";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Payment received | Sky Livery",
  robots: { index: false, follow: false },
};

// Best-effort lookup so we can pre-fill the return-trip form with the
// same customer's addresses, reversed. Fails silent if we can't get the
// admin client (public page hits this so the ref query is unauth).
async function loadTrip(tripId: string | undefined) {
  if (!tripId) return null;
  try {
    const sb = supabaseAdmin();
    const { data } = await sb
      .from("bookings")
      .select(
        "pickup_address, dropoff_address, customer_name, customer_phone, customer_email"
      )
      .eq("trip_id", tripId)
      .single();
    return data;
  } catch {
    return null;
  }
}

function ReturnTripUpsell({
  pickup,
  dropoff,
}: {
  pickup: string;
  dropoff: string;
}) {
  // Swap addresses for the return leg. Build a /book URL pre-filled
  // so the customer lands with everything already typed in.
  const url = `/book?pickup=${encodeURIComponent(dropoff)}&dropoff=${encodeURIComponent(pickup)}`;
  return (
    <div className="mt-12 mx-auto max-w-lg bg-navy/50 border border-gold/30 rounded-2xl p-6 sm:p-7 text-left">
      <div className="flex items-center gap-3 mb-3">
        <FleurIcon className="w-4 h-5 text-gold" />
        <p className="text-[10px] tracking-[0.3em] uppercase text-gold">
          One more thing
        </p>
      </div>
      <h2 className="font-display text-2xl text-cream font-semibold mb-2">
        Book your return trip
      </h2>
      <p className="text-cream/70 text-sm leading-relaxed mb-5">
        Coming back the same way? Lock in the return leg now with the addresses reversed. Same flat rate, same chauffeur experience, no surge on the way home.
      </p>
      <div className="bg-navy/60 border-l-2 border-gold/50 rounded-md p-3 mb-5 text-xs text-cream/80 leading-relaxed">
        <div className="text-cream/50 text-[9px] tracking-[0.25em] uppercase mb-1">Return route</div>
        <div>↑ {dropoff}</div>
        <div>↓ {pickup}</div>
      </div>
      <a
        href={url}
        className="inline-block bg-gold text-navy px-5 py-2.5 rounded-md text-sm font-bold tracking-wide hover:bg-cream transition-colors"
      >
        Book the return →
      </a>
    </div>
  );
}

async function PaidCard({ tripRef }: { tripRef?: string }) {
  const trip = await loadTrip(tripRef);
  return (
    <>
      <div className="max-w-lg mx-auto text-center py-16">
        <Fleur className="mb-8" />
        <div className="w-20 h-20 rounded-full border border-gold/60 flex items-center justify-center mx-auto mb-6">
          <FleurIcon className="w-8 h-10 text-gold brass-shimmer" />
        </div>
        <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
          Payment received
        </p>
        <h1 className="font-display text-4xl sm:text-5xl text-cream font-semibold mb-6 gold-sweep">
          Merci. You are all set.
        </h1>
        {tripRef && (
          <div className="mb-8 flex justify-center">
            <TicketRef tripId={tripRef} />
          </div>
        )}
        <p className="text-cream/70 text-base leading-relaxed mb-8">
          Your fare has been captured. Square will email you a branded receipt shortly.
          Dispatch will assign your driver and text or email you their name, vehicle,
          and plate roughly thirty minutes before pickup.
        </p>
        <a
          href="/"
          className="inline-block bg-gold text-navy px-6 py-3 rounded-md font-bold tracking-wide hover:bg-cream transition-colors"
        >
          Back to Sky Livery
        </a>
      </div>
      {trip?.pickup_address && trip?.dropoff_address && (
        <>
          <div className="iron-lace max-w-md mx-auto opacity-60" aria-hidden="true" />
          <ReturnTripUpsell
            pickup={trip.pickup_address}
            dropoff={trip.dropoff_address}
          />
        </>
      )}
    </>
  );
}

export default async function PaidPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const params = await searchParams;
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-nola-radial pt-28 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense>
            <PaidCard tripRef={params.ref} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
