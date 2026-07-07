import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

const url = "https://skylivery.llc/wedding-limo-new-orleans";

export const metadata: Metadata = {
  title: "Wedding Limo & SUV Service New Orleans | Sky Livery LLC",
  description:
    "Wedding-day luxury SUV service in New Orleans. Getting ready, ceremony, reception, sendoff. Flat-rate pricing, no surge, black-tie chauffeur on request.",
  alternates: { canonical: url },
  openGraph: {
    title: "Wedding Limo Service New Orleans | Sky Livery LLC",
    description: "Full-day wedding SUV in New Orleans. Flat rates, no surge.",
    url,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Wedding transportation",
  provider: { "@type": "LimousineService", name: "Sky Livery LLC", url: "https://skylivery.llc" },
  areaServed: { "@type": "City", name: "New Orleans" },
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: "85",
    description: "Hourly wedding charter, $85 per hour, gratuity included.",
  },
  url,
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Weddings & Events"
      h1="Your wedding day, on time to the minute."
      intro="Sky Livery handles the getting-ready run, the ceremony arrival, the reception drop, and the late-night sendoff. One chauffeur, one black SUV, one calm day."
      bookingContext={{
        label: "Wedding & Events",
        subtitle: "Full-day charter",
        serviceType: "wedding",
      }}
      schema={schema}
      highlights={[
        { title: "Full-day charter", body: "Book by the hour. One driver assigned to your wedding party." },
        { title: "Black-tie chauffeur", body: "Suit and tie standard. Black tie on request." },
        { title: "Six passengers", body: "Bride, groom, parents, wedding-planner. All fit comfortably." },
        { title: "Backup plan", body: "Weather, timing changes, hotel switches. We adjust in real time." },
      ]}
      faqs={[
        { q: "How does hourly wedding charter work?", a: "$85/hr, 3-hour weekday or 4-hour weekend minimum, one dedicated chauffeur and SUV for the full block." },
        { q: "Can you coordinate multiple pickups?", a: "Yes. Brides room to church to reception to hotel is standard." },
        { q: "Do you decorate the vehicle?", a: "Light ribbon or Just Married sign on request. We keep it tasteful." },
        { q: "Do you serve Windsor Court, Ritz, and Roosevelt wedding parties?", a: "Yes, and every property in the Quarter, CBD, and Garden District." },
      ]}
    />
  );
}
