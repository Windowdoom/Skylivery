import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "MSY Airport Transfer | $105 Flat Rate | Sky Livery LLC",
  description:
    "Flat $105 SUV transfer from Louis Armstrong International (MSY) to New Orleans. Flight tracked, meet & greet, gratuity included, no surge. Book online or call.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="MSY Airport Transfer"
      h1="Louis Armstrong to your door, $105 flat."
      intro="One flat rate to and from MSY. We watch your flight, meet you at baggage claim, handle the bags. No surge on holidays, no meter, no surprises."
      highlights={[
        { title: "$105 flat rate", body: "Any address in New Orleans metro. All-in, gratuity included." },
        { title: "Flight tracking", body: "Delayed? We already know. Your driver adjusts automatically." },
        { title: "Meet & greet", body: "Chauffeur at baggage claim with a Sky Livery sign." },
        { title: "6 passengers, 6 bags", body: "Full-size luxury SUV. Plenty of room for a family or crew." },
      ]}
      faqs={[
        { q: "What is the MSY flat rate?", a: "$105 for a luxury SUV to or from any New Orleans metro address. Gratuity included." },
        { q: "Do you charge extra during festivals?", a: "No. Same rate during Mardi Gras, Jazz Fest, Sugar Bowl, and every day of the year." },
        { q: "How early should I book?", a: "The sooner the better, but same-day and 24/7 requests are welcome. We dispatch around the clock." },
        { q: "Do you track my flight?", a: "Yes. We monitor arrivals and adjust pickup automatically for delays or early arrivals." },
      ]}
    />
  );
}
