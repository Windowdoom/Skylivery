import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Metairie Car Service | Luxury SUV | Sky Livery LLC",
  description:
    "Metairie luxury SUV service. Airport transfers, corporate rides, night out. Flat-rate pricing, gratuity included, no surge. Book online or call.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Metairie Car Service"
      h1="Metairie, in the seat you deserve."
      intro="From Lakeside to Lakeway, Elmwood to Old Metairie, Sky Livery is minutes away. We&apos;re based in Kenner, so we&apos;re your neighbor."
      highlights={[
        { title: "Minutes away", body: "Based in Kenner. Fastest pickup in the parish." },
        { title: "Airport-adjacent", body: "MSY runs at $105 flat, day or night." },
        { title: "Corporate accounts", body: "Recurring rides, monthly invoices, no meter." },
        { title: "Six-passenger SUV", body: "Family, colleagues, luggage, done." },
      ]}
      faqs={[
        { q: "Do you serve all of Metairie?", a: "Yes. Old Metairie, Lakeway, Fat City, Bucktown, Elmwood, all of it." },
        { q: "How long is a pickup wait?", a: "We aim for under 20 minutes with advance notice. Same-day is welcome." },
        { q: "Do you handle corporate accounts?", a: "Yes. Monthly invoicing, dedicated point of contact, priority dispatch." },
        { q: "Is gratuity extra?", a: "No. Every fare includes gratuity." },
      ]}
    />
  );
}
