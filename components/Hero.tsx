"use client";
import FadeIn from "./FadeIn";
import { FleurIcon } from "./Fleur";
import UnderlineSwash from "./UnderlineSwash";
import QuickQuote from "./QuickQuote";
import NolaSkyline from "./NolaSkyline";

const popular = [
  { label: "MSY Airport", href: "/book?dropoff=Louis+Armstrong+International+Airport" },
  { label: "French Quarter", href: "/book?dropoff=French+Quarter+New+Orleans" },
  { label: "Garden District", href: "/book?dropoff=Garden+District+New+Orleans" },
  { label: "Mardi Gras", href: "/mardi-gras-transportation" },
];

const stats = [
  ["$105", "MSY flat rate"],
  ["24/7", "Dispatch"],
  ["0%", "Surge, ever"],
  ["Up to 7", "Passengers"],
  ["Insured", "& Licensed"],
];

const neighborhoods = [
  "French Quarter", "Garden District", "Uptown", "Bywater", "Marigny",
  "CBD", "Warehouse", "Kenner", "Metairie", "Lakeview", "Mid-City",
  "Mandeville", "Covington", "Slidell", "Algiers", "Belle Chasse",
];

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-14 overflow-hidden bg-nola-radial flex flex-col grain">
      {/* Ambient warmth, slow drifting like Mardi Gras lanterns */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[680px] h-[680px] rounded-full bg-gold/[0.09] blur-3xl drift-left" />
        <div className="absolute top-1/3 -right-40 w-[560px] h-[560px] rounded-full bg-wine/[0.16] blur-3xl drift-right" />
        <div className="absolute bottom-0 inset-x-0 h-56 bg-gradient-to-t from-dark to-transparent" />
      </div>

      {/* Ornamental corner scroll */}
      <div className="absolute top-24 right-8 w-40 h-40 opacity-[0.08] hidden md:block pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
          <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" fill="none" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
          <path d="M50 8 Q60 30 50 50 Q40 30 50 8" fill="currentColor" opacity="0.6" />
          <path d="M50 92 Q60 70 50 50 Q40 70 50 92" fill="currentColor" opacity="0.6" />
          <path d="M8 50 Q30 40 50 50 Q30 60 8 50" fill="currentColor" opacity="0.6" />
          <path d="M92 50 Q70 40 50 50 Q70 60 92 50" fill="currentColor" opacity="0.6" />
        </svg>
      </div>

      {/* Neighborhood marquee at the top of the hero */}
      <div className="relative border-y border-gold/15 bg-navy/30 overflow-hidden">
        <div className="marquee flex whitespace-nowrap py-2 text-[10px] tracking-[0.3em] uppercase text-gold/70">
          {[...neighborhoods, ...neighborhoods].map((n, i) => (
            <span key={i} className="mx-6 flex items-center gap-4">
              <FleurIcon className="w-2.5 h-3 text-gold/70" />
              {n}
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center relative">
        <div className="text-center max-w-3xl mx-auto">
          <FadeIn>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.35em] uppercase text-gold mt-8 mb-8">
              <FleurIcon className="w-3 h-4" />
              Sky Livery LLC · Nouvelle-Orléans
              <FleurIcon className="w-3 h-4" />
            </span>
          </FadeIn>

          <FadeIn delay={0.05}>
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[1.02] font-semibold text-cream">
              Arrive Like You
              <br />
              <span className="relative inline-block">
                <span className="italic gold-sweep">Own The City</span>
                <UnderlineSwash className="absolute left-0 right-0 -bottom-4 sm:-bottom-5 h-4 sm:h-6 w-full text-gold" />
              </span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.15}>
            <p className="mt-10 text-cream/75 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              A luxury SUV, a professional chauffeur, a flat rate. Airport transfers, weddings,
              corporate travel, and nights out in the Quarter. Gratuity included. No surge, 365 days a year.
            </p>
          </FadeIn>
        </div>

        <FadeIn delay={0.25} y={30}>
          <div className="mt-12">
            <QuickQuote />
          </div>
        </FadeIn>

        <FadeIn delay={0.35}>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto">
            <span className="text-[10px] tracking-[0.3em] uppercase text-gold/80 mr-2">
              Popular
            </span>
            {popular.map((p) => (
              <a
                key={p.label}
                href={p.href}
                className="px-4 py-1.5 rounded-full border border-gold/25 text-cream/80 text-xs hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
              >
                {p.label}
              </a>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* NOLA silhouette footer */}
      <div className="absolute bottom-24 sm:bottom-28 md:bottom-32 inset-x-0 pointer-events-none z-0 opacity-70">
        <NolaSkyline className="w-full h-32 sm:h-40 md:h-48" />
      </div>

      {/* Stat strip at the very bottom */}
      <FadeIn delay={0.5}>
        <div className="relative mt-10 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 z-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 border-y border-gold/25 divide-x divide-gold/15 bg-navy/60 backdrop-blur-sm rounded-lg">
            {stats.map(([n, l]) => (
              <div key={l} className="py-5 px-4 text-center">
                <div className="font-display text-2xl sm:text-3xl text-cream font-semibold">{n}</div>
                <div className="text-gold text-[10px] uppercase tracking-[0.25em] mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
