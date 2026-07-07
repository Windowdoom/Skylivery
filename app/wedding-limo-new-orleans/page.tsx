import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Wedding Limo Service New Orleans | Sky Livery LLC",
  description: "Luxury SUV wedding transportation in New Orleans. Flat rates, professional chauffeur, coordinated timing. Arrive in style on your day.",
  keywords: "wedding limo New Orleans, wedding car service, New Orleans wedding transportation, luxury SUV wedding, bridal car service New Orleans",
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
                Wedding day<br />transportation
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>Your wedding day has a hundred moving parts. Transportation should not be one of them. Sky Livery provides luxury SUV service for weddings across Greater New Orleans, from ceremony to reception and everything between.</p><p>We coordinate timing with your wedding planner, stage the vehicle at the venue, and ensure the bride, groom, and wedding party arrive exactly when and where they need to be. Oak Alley Plantation, The Roosevelt, Race and Religious, Commander Palace, or any venue in the city.</p><p>Flat-rate pricing. No hourly surprises. No surge. Gratuity included. One less thing to worry about on the biggest day.</p>
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
