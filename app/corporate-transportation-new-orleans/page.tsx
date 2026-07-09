import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

const url = "https://www.skyliverynola.com/corporate-transportation-new-orleans";

export const metadata: Metadata = {
  title: "Corporate Transportation New Orleans | Sky Livery LLC",
  description:
    "Corporate luxury SUV service in New Orleans. Executive rides, roadshows, client entertainment, convention transfers. Monthly invoicing, no surge, no meter.",
  alternates: { canonical: url },
  openGraph: {
    title: "Corporate Transportation | Sky Livery LLC",
    description: "Executive SUV service in New Orleans. Monthly invoicing.",
    url,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Corporate transportation",
  provider: { "@type": "LimousineService", name: "Sky Livery LLC", url: "https://www.skyliverynola.com" },
  areaServed: { "@type": "City", name: "New Orleans" },
  url,
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Corporate Travel"
      h1="Executive travel, on your schedule."
      intro="Roadshows, client dinners, convention transfers, board meetings. Sky Livery bills monthly, keeps clean records, and shows up before you do."
      bookingContext={{
        label: "Corporate Travel",
        subtitle: "Executive ride",
        serviceType: "corporate",
      }}
      schema={schema}
      highlights={[
        { title: "Monthly invoicing", body: "One invoice per month. Rider name, date, time, route, receipt." },
        { title: "Roadshow-ready", body: "Multi-stop days at flat rates. No meter creep on traffic." },
        { title: "Convention center runs", body: "Ernest N. Morial to any hotel, priced flat." },
        { title: "Discreet chauffeurs", body: "Suit and tie. NDA on request." },
      ]}
      faqs={[
        { q: "Can we set up a corporate account?", a: "Yes. Open one instantly at skyliverynola.com/corporate — one form for company details plus your first ride, invoiced with Net 15 or Net 30 terms via Square." },
        { q: "Do you handle multi-city roadshows?", a: "Yes. We quote the day as a block and coordinate with your assistant or EA." },
        { q: "What&apos;s the Convention Center flat rate?", a: "Depends on hotel. The online calculator returns your all-in price in seconds." },
        { q: "Do drivers dress in business attire?", a: "Yes. Suit and tie standard, chauffeur cap available on request." },
      ]}
      cta={{
        label: "Open a corporate account",
        href: "/corporate",
        eyebrow: "For accounts, not one-time rides",
        body: "Set up monthly invoicing, PO numbers, and cost centers in about 90 seconds. The first ride goes on your first invoice.",
      }}
    />
  );
}
