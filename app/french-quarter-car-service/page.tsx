import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "French Quarter Car Service New Orleans | Sky Livery LLC",
  description: "Luxury SUV service to and from the French Quarter, New Orleans. Flat rates, no surge pricing, professional chauffeur. Book online or call.",
  keywords: "French Quarter car service, New Orleans limo French Quarter, Bourbon Street transportation, French Quarter airport transfer, Royal Street car service",
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
                French Quarter<br />car service
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>Navigating the French Quarter by car requires a driver who knows every one-way street, every construction detour, and every parade route closure. Sky Livery chauffeurs have driven these blocks for years.</p><p>We pick up and drop off at every French Quarter hotel, restaurant, and venue. From the Hotel Monteleone on Royal Street to Cafe Du Monde on Decatur, from Jackson Square to the Saenger Theatre. Door-to-door, no parking hassles, no surge.</p><p>Flat-rate pricing from anywhere in Greater New Orleans. Gratuity included in every fare.</p>
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
