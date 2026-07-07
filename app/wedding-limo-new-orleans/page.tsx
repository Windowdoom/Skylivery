import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Wedding Limo & SUV Service New Orleans | Sky Livery LLC",
  description:
    "Wedding-day luxury SUV service in New Orleans. Getting ready, ceremony, reception, sendoff. Flat-rate pricing, no surge, chauffeur in black tie on request.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Weddings & Events"
      h1="Your wedding day, on time to the minute."
      intro="Sky Livery handles the getting-ready run, the ceremony arrival, the reception drop, and the late-night sendoff. One chauffeur, one black SUV, one calm day."
      highlights={[
        { title: "Full-day charter", body: "Book by the hour. One driver assigned to your wedding party." },
        { title: "Black-tie chauffeur", body: "Suit and tie standard. Black tie on request." },
        { title: "Six passengers", body: "Bride, groom, parents, wedding-planner — all fit comfortably." },
        { title: "Backup plan", body: "Weather, timing changes, hotel switches — we adjust in real time." },
      ]}
      faqs={[
        { q: "How does hourly wedding charter work?", a: "$85/hr, 3-hour weekday or 4-hour weekend minimum, one dedicated chauffeur and SUV for the full block." },
        { q: "Can you coordinate multiple pickups?", a: "Yes — brides room to church to reception to hotel is standard." },
        { q: "Do you decorate the vehicle?", a: "Light ribbon or Just Married sign on request. We keep it tasteful." },
        { q: "Do you serve Windsor Court, Ritz, and Roosevelt wedding parties?", a: "Yes, and every property in the Quarter, CBD, and Garden District." },
      ]}
    />
  );
}
