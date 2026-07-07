import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Mardi Gras Transportation | Luxury SUV | Sky Livery LLC",
  description:
    "Mardi Gras luxury SUV transportation in New Orleans. No surge pricing during Carnival. Parade route drop-offs, ball transfers, hotel returns. Book online.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Mardi Gras Transportation"
      h1="Carnival without the parking nightmare."
      intro="Every year, ride-shares surge 3x and parade streets close. Sky Livery holds the same flat rate through Carnival and knows the closures before they hit the app."
      highlights={[
        { title: "0% surge, always", body: "Same rate on Fat Tuesday as any Tuesday." },
        { title: "Parade route savvy", body: "We know which streets close, when, and where to drop." },
        { title: "Ball & krewe transfers", body: "Bacchus, Endymion, Orpheus — pre-book the block." },
        { title: "24/7 during Carnival", body: "Dispatch stays open through the whole season." },
      ]}
      faqs={[
        { q: "Do you surge on Fat Tuesday?", a: "Never. Same rate 365 days a year, including Mardi Gras." },
        { q: "Can you drop near the parade route?", a: "Yes — we know the closures and pick the closest legal drop." },
        { q: "Should I book in advance?", a: "Yes, especially for Bacchus Sunday and Fat Tuesday. Book a week ahead if possible." },
        { q: "Do you serve Endymion in Mid-City?", a: "Yes, and every krewe route in the parish." },
      ]}
    />
  );
}
