import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur, { FleurIcon } from "@/components/Fleur";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Payment received | Sky Livery",
  robots: { index: false, follow: false },
};

function PaidCard({ ref: tripRef }: { ref?: string }) {
  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <Fleur className="mb-8" />
      <div className="w-20 h-20 rounded-full border border-gold/60 flex items-center justify-center mx-auto mb-6">
        <FleurIcon className="w-8 h-10 text-gold" />
      </div>
      <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
        Payment received
      </p>
      <h1 className="font-display text-4xl sm:text-5xl text-cream font-semibold mb-4">
        Merci. You are all set.
      </h1>
      {tripRef && (
        <p className="text-gold text-xs tracking-[0.25em] uppercase mb-6">
          Reference {tripRef}
        </p>
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
            <PaidCard ref={params.ref} />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
