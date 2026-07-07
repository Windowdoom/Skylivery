import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Metairie and Kenner Car Service | Sky Livery LLC",
  description: "Luxury SUV service in Metairie, Kenner, and Jefferson Parish. Airport transfers, corporate travel, events. Flat rates, no surge.",
  keywords: "Metairie car service, Kenner limo service, Jefferson Parish transportation, Metairie airport transfer, Veterans Blvd car service",
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
                Metairie and Kenner<br />car service
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>Sky Livery is based in Kenner and serves all of Jefferson Parish including Metairie, Harahan, River Ridge, and Bridge City. We know the Veterans Boulevard corridor, the Causeway approach, and every shortcut between Lakeside Mall and the airport.</p><p>Whether you need an airport run from your Metairie home, executive transportation to a meeting downtown, or a ride to the French Quarter for dinner, our flat-rate pricing keeps it simple. No meter, no surge, gratuity included.</p>
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
