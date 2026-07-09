import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.skyliverynola.com"),
  title: "Sky Livery LLC | Luxury SUV Service New Orleans | Airport Transfers from $105",
  description:
    "Flat-rate luxury SUV service in New Orleans. MSY airport transfers, corporate travel, weddings, events. No surge pricing. Licensed and insured. Gratuity included. Book online or call (504) 339-6861.",
  keywords:
    "New Orleans car service, luxury SUV New Orleans, airport transfer MSY, limo service New Orleans, CPNC licensed, no surge pricing, French Quarter car service, Kenner limo, Metairie car service",
  openGraph: {
    title: "Sky Livery LLC | Luxury SUV Service New Orleans",
    description: "Flat-rate luxury SUV service. MSY airport transfers from $105. No surge. Gratuity included.",
    type: "website",
    locale: "en_US",
    siteName: "Sky Livery LLC",
    url: "https://www.skyliverynola.com",
    images: ["/logo-full.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sky Livery LLC | Luxury SUV Service New Orleans",
    description: "Flat-rate luxury SUV service. MSY from $105. No surge. Gratuity included.",
    images: ["/logo-full.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

const businessSchema = {
  "@context": "https://schema.org",
  "@type": "LimousineService",
  name: "Sky Livery LLC",
  url: "https://www.skyliverynola.com",
  logo: "https://www.skyliverynola.com/logo-full.png",
  image: "https://www.skyliverynola.com/logo-full.png",
  telephone: "(504) 339-6861",
  email: "skyliveryllc@gmail.com",
  description:
    "Flat-rate luxury SUV service in New Orleans. Airport transfers, corporate travel, weddings, events. No surge pricing. Licensed and insured, 45+ years chauffeur experience.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "New Orleans",
    addressRegion: "LA",
    addressCountry: "US",
  },
  geo: { "@type": "GeoCoordinates", latitude: 29.9511, longitude: -90.0715 },
  areaServed: [
    { "@type": "City", name: "New Orleans" },
    { "@type": "City", name: "Kenner" },
    { "@type": "City", name: "Metairie" },
    { "@type": "City", name: "Harahan" },
    { "@type": "City", name: "Chalmette" },
    { "@type": "City", name: "Gretna" },
    { "@type": "City", name: "Marrero" },
    { "@type": "City", name: "Mandeville" },
    { "@type": "City", name: "Covington" },
    { "@type": "City", name: "Madisonville" },
    { "@type": "City", name: "Slidell" },
    { "@type": "City", name: "Hammond" },
  ],
  serviceType: [
    "Airport transfer",
    "Corporate transportation",
    "Wedding transportation",
    "Event transportation",
    "Hourly chauffeur service",
    "Point to point transfer",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Sky Livery service catalog",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "MSY Airport Transfer",
          description:
            "Flat-rate luxury SUV to or from Louis Armstrong New Orleans International. Flight tracked, meet-and-greet at baggage claim, 30 minutes of complimentary wait time, gratuity included.",
        },
        priceCurrency: "USD",
        price: "105",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          minPrice: "105",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Hourly Chauffeur Charter",
          description:
            "Full-day and evening charter service with a dedicated professional chauffeur. Three-hour weekday, four-hour weekend minimum.",
        },
        priceCurrency: "USD",
        price: "85",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          minPrice: "85",
          referenceQuantity: {
            "@type": "QuantitativeValue",
            value: 1,
            unitCode: "HUR",
          },
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Point-to-Point Transfer",
          description:
            "Flat-rate transfers within Greater New Orleans. No surge pricing, gratuity included.",
        },
        priceCurrency: "USD",
        price: "35",
        priceSpecification: {
          "@type": "PriceSpecification",
          priceCurrency: "USD",
          minPrice: "35",
        },
      },
    ],
  },
  priceRange: "$$",
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    opens: "00:00",
    closes: "23:59",
  },
  paymentAccepted: "Cash, Credit Card, Apple Pay, Google Pay",
  currenciesAccepted: "USD",
  slogan: "Arrive like you own the city.",
  knowsLanguage: ["en", "fr"],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does an airport transfer from MSY cost?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "$105 flat rate for a luxury SUV, all-inclusive with gratuity. No surge pricing during Mardi Gras, Jazz Fest, or any event.",
      },
    },
    {
      "@type": "Question",
      name: "Does Sky Livery surge price during Mardi Gras?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. Sky Livery charges the same flat rate 365 days a year. No surge pricing, ever.",
      },
    },
    {
      "@type": "Question",
      name: "Is gratuity included in the fare?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Every Sky Livery fare includes gratuity. The price you see is the price you pay.",
      },
    },
    {
      "@type": "Question",
      name: "What vehicle does Sky Livery use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sky Livery operates a fleet of full-size luxury SUVs, each seating up to 7 passengers with 6 bags.",
      },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </head>
      <body className="font-sans bg-navy text-cream">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
