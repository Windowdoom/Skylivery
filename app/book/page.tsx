import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BookingForm from "@/components/BookingForm";
import Fleur, { FleurIcon } from "@/components/Fleur";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Book Your Ride | Sky Livery LLC | Luxury SUV, New Orleans",
  description:
    "Reserve a luxury SUV in New Orleans. Flat rate, gratuity included, no surge. MSY airport transfers, hourly charter, weddings, corporate. Book online in 60 seconds.",
};

const promises = [
  { title: "Flat rate quoted upfront", body: "No meter. No surge. The price you see is the price you pay." },
  { title: "Gratuity included", body: "Every fare, every time. Never a surprise line item." },
  { title: "Flight tracking", body: "We watch inbound flights and adjust pickup automatically." },
  { title: "24/7 dispatch", body: "Same-day and late-night bookings welcome. Real humans answer." },
];

export default function BookPage() {
  return (
    <>
      <Navbar />
      <main className="relative">
        <section className="relative pt-28 pb-16 bg-nola-radial overflow-hidden">
          {/* ornamental corners */}
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-gold/[0.06] blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-wine/[0.10] blur-3xl" />
          </div>

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <Fleur className="mb-8" />
            </FadeIn>
            <div className="text-center max-w-2xl mx-auto">
              <FadeIn delay={0.05}>
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">Reservations</p>
              </FadeIn>
              <FadeIn delay={0.1}>
                <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream leading-[1.05]">
                  Book your ride.
                  <br />
                  <span className="italic text-gold">Sixty seconds. Flat rate.</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.2}>
                <p className="text-cream/75 mt-6 text-base sm:text-lg leading-relaxed">
                  Enter your pickup and dropoff. We&apos;ll return a flat, all-inclusive rate.
                  Gratuity and taxes included, no surge, ever. Confirm and we&apos;ll text you before pickup.
                </p>
              </FadeIn>
            </div>

            <div className="mt-12 grid lg:grid-cols-5 gap-10 items-start">
              {/* Big prominent booking form on the left */}
              <div className="lg:col-span-3">
                <FadeIn delay={0.2} y={30}>
                  <BookingForm />
                </FadeIn>
              </div>

              {/* Promises + call fallback on the right */}
              <div className="lg:col-span-2 space-y-6">
                <FadeIn delay={0.25}>
                  <div className="bg-navy/50 border border-gold/25 rounded-2xl p-6 sm:p-7">
                    <div className="flex items-center gap-3 mb-5">
                      <FleurIcon className="w-4 h-5 text-gold" />
                      <h2 className="text-cream font-display text-xl font-semibold">
                        Our promise to you
                      </h2>
                    </div>
                    <ul className="space-y-5">
                      {promises.map((p) => (
                        <li key={p.title} className="border-l-2 border-gold/50 pl-4">
                          <div className="text-cream font-semibold text-sm">{p.title}</div>
                          <div className="text-cream/65 text-sm mt-1 leading-relaxed">{p.body}</div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </FadeIn>

                <FadeIn delay={0.35}>
                  <div className="bg-gold/[0.05] border border-gold/30 rounded-2xl p-6 text-center">
                    <p className="text-cream/70 text-sm">Prefer to speak with dispatch?</p>
                    <a
                      href="tel:+15044790454"
                      className="block mt-2 text-gold font-display text-3xl font-semibold hover:text-cream transition-colors"
                    >
                      (504) 479-0454
                    </a>
                    <p className="text-cream/50 text-xs mt-2">
                      24 hours · 7 days · every day of the year
                    </p>
                  </div>
                </FadeIn>

                <FadeIn delay={0.45}>
                  <div className="text-center text-xs text-cream/60 space-y-1">
                    <p>Licensed · Insured · 45+ Years Chauffeur Experience</p>
                    <p className="text-gold/80 italic font-display">
                      Arrive like you own the city.
                    </p>
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
