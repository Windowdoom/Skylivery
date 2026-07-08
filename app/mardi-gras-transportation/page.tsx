import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

const url = "https://www.skyliverynola.com/mardi-gras-transportation";

export const metadata: Metadata = {
  title: "Mardi Gras Transportation | Luxury SUV | Sky Livery LLC",
  description:
    "Mardi Gras luxury SUV transportation in New Orleans. No surge pricing during Carnival. Parade route drop-offs, ball transfers, hotel returns. Book online.",
  alternates: { canonical: url },
  openGraph: {
    title: "Mardi Gras Transportation | Sky Livery LLC",
    description: "SUV service through Carnival. No surge, ever.",
    url,
    type: "website",
  },
};

const schema = {
  "@context": "https://schema.org",
  "@type": "Event",
  name: "Mardi Gras in New Orleans",
  location: { "@type": "Place", name: "New Orleans, Louisiana" },
  description:
    "Sky Livery provides luxury SUV transportation throughout the Mardi Gras and Carnival season in Greater New Orleans.",
  organizer: { "@type": "LimousineService", name: "Sky Livery LLC", url: "https://www.skyliverynola.com" },
  url,
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Mardi Gras Transportation"
      h1="Carnival without the parking nightmare."
      intro="Every year, ride-shares surge 3x and parade streets close. Sky Livery holds the same flat rate through Carnival and knows the closures before they hit the app."
      bookingContext={{
        label: "Mardi Gras Ride",
        subtitle: "Carnival transport",
        serviceType: "mardi_gras",
      }}
      schema={schema}
      highlights={[
        { title: "0% surge, always", body: "Same rate on Fat Tuesday as any Tuesday." },
        { title: "Parade route savvy", body: "We know which streets close, when, and where to drop." },
        { title: "Ball and krewe transfers", body: "Bacchus, Endymion, Orpheus. Pre-book the block." },
        { title: "24/7 during Carnival", body: "Dispatch stays open through the whole season." },
      ]}
      faqs={[
        { q: "Do you surge on Fat Tuesday?", a: "Never. Same rate 365 days a year, including Mardi Gras." },
        { q: "Can you drop near the parade route?", a: "Yes. We know the closures and pick the closest legal drop." },
        { q: "Should I book in advance?", a: "Yes, especially for Bacchus Sunday and Fat Tuesday. Book a week ahead if possible." },
        { q: "Do you serve Endymion in Mid-City?", a: "Yes, and every krewe route in the parish." },
      ]}
    />
  );
}
