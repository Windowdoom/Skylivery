import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WhySection from "@/components/WhySection";
import Vehicle from "@/components/Vehicle";
import Services from "@/components/Services";
import Areas from "@/components/Areas";
import TrustBar from "@/components/TrustBar";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <WhySection />
      <Services />
      <Vehicle />
      <Areas />
      <TrustBar />
      <CTA />
      <Footer />
    </main>
  );
}
