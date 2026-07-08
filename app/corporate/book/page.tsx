import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur from "@/components/Fleur";
import CorporateBookingForm from "@/components/CorporateBookingForm";

const url = "https://www.skyliverynola.com/corporate/book";

export const metadata: Metadata = {
  title: "Corporate Booking | Sky Livery LLC",
  description:
    "Book a luxury SUV corporate ride with invoicing. Sky Livery LLC, New Orleans.",
  alternates: { canonical: url },
  robots: { index: false, follow: false },
};

export default function CorporateBookPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 bg-nola-radial">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fleur className="mb-8" />
          <div className="text-center max-w-xl mx-auto mb-10">
            <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
              Corporate
            </p>
            <h1 className="font-display text-4xl sm:text-5xl text-cream font-semibold leading-[1.05] mb-4">
              Book your ride.
              <br />
              <span className="italic text-gold">Invoice at month&apos;s end.</span>
            </h1>
            <p className="text-cream/70 text-sm sm:text-base leading-relaxed">
              Tell us about your company and the ride. We generate a Square invoice
              billed to your account. Every future booking rolls into the same
              monthly statement.
            </p>
          </div>
          <CorporateBookingForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
