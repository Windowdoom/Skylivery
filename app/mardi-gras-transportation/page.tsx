import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Mardi Gras Transportation New Orleans | Sky Livery LLC",
  description: "Luxury SUV service during Mardi Gras in New Orleans. Same flat rate, no surge pricing. Professional chauffeur navigates parade routes.",
  keywords: "Mardi Gras transportation, Mardi Gras car service, New Orleans Mardi Gras limo, no surge Mardi Gras, Fat Tuesday transportation",
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
                Mardi Gras<br />transportation
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>Mardi Gras is the single hardest time to get a ride in New Orleans. Uber and Lyft surge to 4-8x normal pricing. Taxis disappear. Streets close for parades. GPS stops working because the routes change daily.</p><p>Sky Livery charges the same flat rate during Mardi Gras that we charge every other day of the year. No surge. No dynamic pricing. No surprises. Your chauffeur knows every parade route, every street closure, and every alternate path through the city.</p><p>Book early for Fat Tuesday weekend and the final week of Carnival. We recommend reserving 4-6 weeks in advance for Mardi Gras dates.</p>
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
