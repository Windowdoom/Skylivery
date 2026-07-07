import type { Metadata } from "next";
import LandingPage from "@/components/LandingPage";

export const metadata: Metadata = {
  title: "Garden District & Uptown Car Service | Sky Livery LLC",
  description:
    "Luxury SUV service in the Garden District and Uptown. Restaurant reservations, hotel transfers, weddings. Flat-rate pricing, no surge, gratuity included.",
};

export default function Page() {
  return (
    <LandingPage
      eyebrow="Garden District & Uptown"
      h1="St. Charles to Magazine, curbside."
      intro="From Commander&apos;s Palace to the streetcar, from the Pontchartrain to a home on Prytania. Sky Livery gets you there in the black SUV you&apos;d expect."
      highlights={[
        { title: "Restaurant reservations", body: "Commander&apos;s, Emeril&apos;s, Coquette, Superior, Clancy&apos;s. Dropped at the door." },
        { title: "Wedding-friendly", body: "Getting-ready to ceremony to reception, one driver, all night." },
        { title: "Historic-home tours", body: "Book by the hour with a chauffeur who knows Prytania and 1st." },
        { title: "Flat-rate certainty", body: "Same rate to Uptown from anywhere in the metro." },
      ]}
      faqs={[
        { q: "Do you know the Garden District streets?", a: "Yes. We know the one-ways, the streetcar timing, and the driveways that fit an SUV." },
        { q: "Can we book by the hour for a wedding?", a: "Yes. Hourly charter is $85/hr with a 3-hour weekday, 4-hour weekend minimum." },
        { q: "Do you drop at the Pontchartrain and Columns hotels?", a: "Yes, and at every historic hotel Uptown." },
        { q: "Any Mardi Gras parade-day surge?", a: "No. Same rate 365 days a year." },
      ]}
    />
  );
}
