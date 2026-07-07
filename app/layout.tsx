import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });

export const metadata: Metadata = {
  title: "Sky Livery LLC | Luxury SUV Service New Orleans | Airport Transfers from $105",
  description: "Flat-rate luxury SUV service in New Orleans. MSY airport transfers, corporate travel, weddings, events. No surge pricing. CPNC licensed. Gratuity included. Book online or call (504) 000-0000.",
  keywords: "New Orleans car service, luxury SUV New Orleans, airport transfer MSY, limo service New Orleans, CPNC licensed, no surge pricing, French Quarter car service, Kenner limo, Metairie car service",
  openGraph: {
    title: "Sky Livery LLC | Luxury SUV Service New Orleans",
    description: "Flat-rate luxury SUV service. MSY airport transfers from $105. No surge. Gratuity included.",
    type: "website",
    locale: "en_US",
    siteName: "Sky Livery LLC",
  },
};

const schemaData = {
  "@context": "https://schema.org",
  "@type": "LimousineBusService",
  name: "Sky Livery LLC",
  url: "https://skylivery.llc",
  telephone: "(504) 000-0000",
  email: "info@skylivery.llc",
  description: "Flat-rate luxury SUV service in New Orleans. Airport transfers, corporate travel, weddings, events. No surge pricing. CPNC licensed.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Kenner",
    addressRegion: "LA",
    postalCode: "70062",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 29.9841, longitude: -90.2417 },
  areaServed: [
    { "@type": "City", name: "Kenner" },
    { "@type": "City", name: "New Orleans" },
    { "@type": "City", name: "Metairie" },
    { "@type": "City", name: "Mandeville" },
    { "@type": "City", name: "Covington" },
    { "@type": "City", name: "Slidell" },
  ],
  priceRange: "$$",
  openingHoursSpecification: { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "00:00", closes: "23:59" },
  paymentAccepted: "Cash, Credit Card",
  currenciesAccepted: "USD",
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "How much does an airport transfer from MSY cost?", acceptedAnswer: { "@type": "Answer", text: "$105 flat rate for a luxury SUV, all-inclusive with gratuity. No surge pricing during Mardi Gras, Jazz Fest, or any event." }},
    { "@type": "Question", name: "Does Sky Livery surge price during Mardi Gras?", acceptedAnswer: { "@type": "Answer", text: "No. Sky Livery charges the same flat rate 365 days a year. No surge pricing, ever." }},
    { "@type": "Question", name: "Is gratuity included in the fare?", acceptedAnswer: { "@type": "Answer", text: "Yes. Every Sky Livery fare includes gratuity. The price you see is the price you pay." }},
    { "@type": "Question", name: "What vehicle does Sky Livery use?", acceptedAnswer: { "@type": "Answer", text: "Sky Livery operates a full-size luxury SUV (Chevrolet Suburban or equivalent) seating up to 6 passengers with luggage." }},
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
