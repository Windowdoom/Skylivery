"use client";
import BookingForm from "./BookingForm";
import FadeIn from "./FadeIn";
import { FleurIcon } from "./Fleur";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden bg-nola-radial">
      {/* Ambient warmth */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute -top-40 -left-32 w-[680px] h-[680px] rounded-full bg-gold/[0.07] blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-[560px] h-[560px] rounded-full bg-wine/[0.12] blur-3xl" />
        {/* Wrought-iron scroll motif top corner */}
        <div className="absolute top-24 right-8 w-40 h-40 opacity-[0.06] hidden md:block">
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold">
            <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="1" fill="none" />
            <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1" fill="none" />
            <path d="M50 8 Q60 30 50 50 Q40 30 50 8" fill="currentColor" opacity="0.6" />
            <path d="M50 92 Q60 70 50 50 Q40 70 50 92" fill="currentColor" opacity="0.6" />
            <path d="M8 50 Q30 40 50 50 Q30 60 8 50" fill="currentColor" opacity="0.6" />
            <path d="M92 50 Q70 40 50 50 Q70 60 92 50" fill="currentColor" opacity="0.6" />
          </svg>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-3">
          <FadeIn>
            <span className="inline-flex items-center gap-3 text-[10px] tracking-[0.3em] uppercase text-gold mb-6">
              <FleurIcon className="w-3 h-4" />
              Sky Livery LLC · Nouvelle-Orléans
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.02] font-semibold text-cream">
              Arrive like you
              <br />
              <span className="italic text-gold">own the city.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-cream/75 text-base sm:text-lg max-w-xl leading-relaxed">
              A luxury black SUV, a professional chauffeur, and a flat rate — from Louis Armstrong to
              the French Quarter, from a Krewe ball to your front door. Gratuity included. No surge,
              365 days a year.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <a
                href="/book"
                className="inline-flex items-center gap-2 bg-gold text-navy px-7 py-3.5 rounded-md font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all"
              >
                Book a ride
                <span className="text-navy">→</span>
              </a>
              <a
                href="tel:+15040000000"
                className="inline-flex items-center gap-2 border border-gold/40 text-cream px-6 py-3.5 rounded-md font-medium hover:border-gold hover:bg-gold/5 transition-all"
              >
                Call (504) 000-0000
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
              {[
                ["$105", "MSY flat rate"],
                ["24/7", "Availability"],
                ["0%", "Surge, ever"],
              ].map(([n, l]) => (
                <div key={l} className="border-t border-gold/30 pt-3">
                  <div className="font-display text-2xl sm:text-3xl text-cream font-semibold">{n}</div>
                  <div className="text-gold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-10 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-cream/60">
              <span>CPNC Licensed</span>
              <span className="w-1 h-1 rounded-full bg-gold/60" />
              <span>Sec. 162-841 Compliant</span>
              <span className="w-1 h-1 rounded-full bg-gold/60" />
              <span>$1M Insured</span>
              <span className="w-1 h-1 rounded-full bg-gold/60" />
              <span>Based in Kenner, LA</span>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-2">
          <FadeIn delay={0.2} y={30}>
            <BookingForm />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
