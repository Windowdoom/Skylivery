import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import Services from "@/components/Services";
import Vehicle from "@/components/Vehicle";
import Areas from "@/components/Areas";
import Reviews from "@/components/Reviews";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <WhySection />
        <Services />
        <Vehicle />
        <Reviews />
        <Areas />
        <TrustBar />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
