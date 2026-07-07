import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

const url = "https://skylivery.llc/french-quarter-car-service";

export const metadata: Metadata = {
  title: "French Quarter Car Service | Luxury SUV | Sky Livery LLC",
  description:
    "Luxury SUV service in the French Quarter, New Orleans. Dinner, jazz, hotels, arrive discreetly. Flat-rate pricing, gratuity included, no surge.",
  alternates: { canonical: url },
  openGraph: {
    title: "French Quarter Car Service | Sky Livery LLC",
    description: "Luxury SUV in the French Quarter. Flat-rate, gratuity included.",
    url,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Car service",
  provider: { "@type": "LimousineService", name: "Sky Livery LLC", url: "https://skylivery.llc" },
  areaServed: { "@type": "Place", name: "French Quarter, New Orleans" },
  url,
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="French Quarter Car Service"
      h1="Bourbon, Royal, and everywhere in between."
      intro="Dinner at Antoine's, jazz on Frenchmen, a suite at the Roosevelt. Sky Livery takes you door to door in a black SUV. No walking six blocks in heels. No fighting for parking."
      bookingContext={{
        label: "French Quarter Ride",
        subtitle: "Point to point",
        serviceType: "transfer",
      }}
      schema={schema}
      highlights={[
        { title: "Discreet arrivals", body: "Black SUV, no logos, chauffeur curbside." },
        { title: "Flat-rate pricing", body: "You know the price before you get in." },
        { title: "Hotels and restaurants", body: "Windsor Court, Ritz, Roosevelt, Commander&apos;s Palace, GW Fins. We know the block." },
        { title: "24/7 dispatch", body: "Late reservation, late flight, late anything." },
      ]}
      faqs={[
        { q: "Can you drop me in the French Quarter?", a: "Yes, anywhere the street allows. We know the one-way pattern and the loading zones." },
        { q: "Is there a minimum charge?", a: "Point-to-point rides have a flat rate. Hourly starts at $85/hr with a 3-hour weekday minimum." },
        { q: "Do you serve the Windsor Court, Roosevelt, and Ritz?", a: "Yes. Every luxury property in the Quarter and CBD." },
        { q: "Any surge pricing during Mardi Gras or Sugar Bowl?", a: "No. Same rate 365 days a year." },
      ]}
    />
  );
}
