import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Corporate Car Service New Orleans | Sky Livery LLC",
  description: "Executive luxury SUV service for corporate travel in New Orleans. Airport transfers, meetings, conferences, client entertainment. Flat rates.",
  keywords: "corporate car service New Orleans, executive transportation, business travel New Orleans, convention center car service, corporate SUV service",
};

export default function Page() {
  return (
    <main>
      <Navbar />
      <section className="bg-gradient-to-br from-dark via-navy to-navy-light pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <FadeIn>
              <p className="text-silver text-xs tracking-[0.2em] uppercase font-semibold mb-3">Sky Livery LLC</p>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Corporate<br />transportation
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>First impressions matter. When your executives, clients, or board members arrive in New Orleans, the transportation sets the tone for the entire visit. Sky Livery provides professional luxury SUV service for corporate travel throughout the city.</p><p>Airport pickups from MSY with flight tracking and meet-and-greet service. Transfers between hotels and the Morial Convention Center, Superdome, or any corporate venue. Multi-stop itineraries for site visits and client entertainment. Hourly charters for all-day executive schedules.</p><p>Flat-rate pricing with consolidated invoicing available for corporate accounts. No surge, no surprises, no excuses.</p>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.1}>
            <BookingForm />
          </FadeIn>
        </div>
      </section>
      <TrustBar />
      <CTA />
      <Footer />
    </main>
  );
}
