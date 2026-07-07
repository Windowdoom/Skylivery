import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import BookingForm from "@/components/BookingForm";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export const metadata: Metadata = {
  title: "Jazz Fest Transportation New Orleans | Sky Livery LLC",
  description: "Luxury SUV service for Jazz Fest in New Orleans. Flat rate to Fair Grounds, no surge pricing. Skip the parking.",
  keywords: "Jazz Fest transportation, Jazz Fest car service, Fair Grounds transportation, New Orleans Jazz Heritage Festival limo, Jazz Fest shuttle",
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
                Jazz Fest<br />transportation
              </h1>
              <div className="text-silver text-sm leading-relaxed space-y-4 max-w-lg">
                <p>The New Orleans Jazz and Heritage Festival draws hundreds of thousands of visitors to the Fair Grounds Race Course every spring. Parking is nonexistent. Rideshare prices surge. Getting in and out of the Gentilly neighborhood during Jazz Fest is a logistics challenge.</p><p>Sky Livery provides flat-rate luxury SUV service to and from Jazz Fest. Your chauffeur knows the staging areas, the drop-off points, and the fastest routes in and out of the Fair Grounds. We pick you up at your hotel, drop you at the gate, and come back when you text us.</p><p>Same flat rate as any other day. No surge. No parking fees. No walking a mile from a remote lot in the heat.</p>
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
