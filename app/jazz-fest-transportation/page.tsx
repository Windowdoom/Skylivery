import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Jazz Fest Transportation | Luxury SUV | Sky Livery LLC",
  description:
    "Jazz Fest luxury SUV transportation. Skip the parking, skip the ride-share surge. Flat-rate drop and pickup at the Fair Grounds. Book online.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Jazz Fest Transportation"
      h1="Skip the parking. Skip the surge."
      intro="Fair Grounds parking is scarce and ride-shares 3x on show days. Sky Livery holds a flat rate and knows the drop-off streets that stay open."
      highlights={[
        { title: "Flat rate, both ways", body: "Same price on the first Friday as the second Sunday." },
        { title: "Drop-off insider", body: "We know which cross-streets the police keep open." },
        { title: "Return-time hold", body: "Pre-book your pickup so you&apos;re not chasing a ride at 7pm." },
        { title: "Six passengers", body: "Take the whole crew in one SUV." },
      ]}
      faqs={[
        { q: "Do you surge on show days?", a: "No. Same flat rate on Jazz Fest weekends as any other day." },
        { q: "Where do you drop at the Fair Grounds?", a: "The closest legal cross-street. Ranges depending on the day&apos;s closures." },
        { q: "Can I lock in a return pickup?", a: "Yes — pre-book both legs so you&apos;re not waiting when the set ends." },
        { q: "Do you serve hotels in the Quarter and CBD?", a: "Yes, plus Metairie, Kenner, and both sides of the lake." },
      ]}
    />
  );
}
