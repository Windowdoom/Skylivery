"use client";
import BookingForm from "./BookingForm";
import FadeIn from "./FadeIn";

export default function Hero() {
  return (
    <section className="relative min-h-screen pt-24 pb-16 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-navy via-navy to-dark" />
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-white/[0.04] blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-silver/[0.06] blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
        <div className="lg:col-span-3">
          <FadeIn>
            <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-silver mb-6">
              <span className="w-8 h-px bg-silver/60" /> Sky Livery LLC · New Orleans
            </span>
          </FadeIn>
          <FadeIn delay={0.05}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] font-semibold text-white">
              Arrive like you
              <br />
              <span className="italic text-silver">own the city.</span>
            </h1>
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="mt-6 text-silver text-base sm:text-lg max-w-xl leading-relaxed">
              Luxury SUV service across New Orleans. Flat-rate pricing, gratuity included, no surge — from
              the airport to the French Quarter to your front door.
            </p>
          </FadeIn>

          <FadeIn delay={0.25}>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
              {[
                ["$105", "MSY flat rate"],
                ["24/7", "Availability"],
                ["0%", "Surge, ever"],
              ].map(([n, l]) => (
                <div
                  key={l}
                  className="border-t border-silver/20 pt-3"
                >
                  <div className="font-display text-2xl sm:text-3xl text-white font-semibold">{n}</div>
                  <div className="text-silver text-[11px] sm:text-xs uppercase tracking-widest mt-1">
                    {l}
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.35}>
            <div className="mt-10 flex items-center gap-4 text-xs text-silver/70">
              <span>CPNC Licensed</span>
              <span className="w-1 h-1 rounded-full bg-silver/40" />
              <span>Sec. 162-841 Compliant</span>
              <span className="w-1 h-1 rounded-full bg-silver/40" />
              <span>$1M Insured</span>
            </div>
          </FadeIn>
        </div>

        <div className="lg:col-span-2">
          <FadeIn delay={0.15} y={30}>
            <BookingForm />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
