import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Garden District and Uptown Car Service | Sky Livery LLC",
  description: "Luxury SUV service to the Garden District, Uptown, Magazine Street, and St. Charles Avenue. Flat rates, no surge.",
  keywords: "Garden District car service, Uptown New Orleans limo, Magazine Street transportation, St Charles Avenue car service, Audubon Park limo",
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
                Garden District<br />and Uptown
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>The Garden District and Uptown are where New Orleans shows its most elegant side. Oak-lined St. Charles Avenue, the historic mansions along Prytania Street, Magazine Street shopping, Audubon Park, Tulane and Loyola campuses.</p><p>Sky Livery provides flat-rate luxury SUV service throughout Uptown and the Garden District. Airport transfers, event transportation, dinner runs, and hourly charters. Your chauffeur knows the neighborhood and handles the logistics so you can enjoy the ride.</p>
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
