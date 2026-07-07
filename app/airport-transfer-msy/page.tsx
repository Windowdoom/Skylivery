import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "MSY Airport Car Service New Orleans | Sky Livery LLC",
  description: "Luxury SUV airport transfer service to and from Louis Armstrong New Orleans International Airport. Flat rate $105, gratuity included, no surge. Flight tracking and meet and greet.",
  keywords: "MSY airport car service, New Orleans airport transfer, airport limo New Orleans, MSY to French Quarter, airport SUV service Kenner",
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
                MSY airport<br />SUV transfer
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>Flat-rate luxury SUV service to and from Louis Armstrong New Orleans International Airport. Your chauffeur tracks your flight in real time, meets you at arrivals with a name sign, handles your luggage, and drives you directly to your destination.</p><p>\$105 flat rate to the French Quarter, CBD, Garden District, or anywhere in Greater New Orleans. Gratuity included. No surge pricing during Mardi Gras, Jazz Fest, or any event. 30-minute complimentary wait time on all arrivals.</p><p>Whether you are arriving for business, a convention at the Morial Center, or a weekend in the French Quarter, Sky Livery gets you there in comfort.</p>
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
