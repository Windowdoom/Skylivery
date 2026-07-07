import Image from "next/image";
import FadeIn from "./FadeIn";
import { FleurIcon } from "./Fleur";

const specs = [
  ["Up to 7", "Passengers"],
  ["6", "Bags"],
  ["Leather", "Interior"],
  ["Climate", "Dual-zone"],
  ["USB-C", "Charging"],
  ["Water", "Complimentary"],
];

export default function Vehicle() {
  return (
    <section id="vehicle" className="py-24 bg-dark border-y border-gold/15">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gold/30 bg-gradient-to-br from-navy via-navy to-dark flex items-center justify-center shadow-brass lift-hover">
            {/* wrought-iron scroll frame */}
            <svg viewBox="0 0 400 300" className="absolute inset-0 w-full h-full text-gold/10 z-20 pointer-events-none">
              <path d="M20 20 L40 40 M380 20 L360 40 M20 280 L40 260 M380 280 L360 260" stroke="currentColor" strokeWidth="2" />
              <path d="M200 40 Q 180 60 200 80 Q 220 60 200 40 Z" fill="currentColor" />
              <path d="M200 220 Q 180 240 200 260 Q 220 240 200 220 Z" fill="currentColor" />
            </svg>
            <div className="absolute inset-0 z-10 overflow-hidden">
              <Image
                src="/suv.jpg"
                alt="Sky Livery luxury SUV"
                width={1600}
                height={1200}
                priority
                quality={92}
                sizes="(min-width: 1024px) 500px, 100vw"
                className="w-full h-full object-cover ken-burns"
              />
            </div>
            {/* subtle vignette so the corner overlays remain readable */}
            <div className="absolute inset-0 z-20 bg-gradient-to-t from-navy/70 via-transparent to-navy/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 z-30 flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-gold">
              <FleurIcon className="w-2.5 h-3 brass-shimmer" />
              Luxury SUV · Onyx Black
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3">The Vehicle</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold mb-4">
            Luxury SUV. Ready when you are.
          </h2>
          <p className="text-cream/70 text-base leading-relaxed mb-8 max-w-lg">
            Our fleet is full-size luxury SUVs. Room for up to seven passengers and six bags,
            detailed daily, staged discreetly. Every ride goes out with a professional chauffeur
            who knows every block from Kenner to the Bywater.
          </p>
          <div className="grid grid-cols-3 gap-4 stag">
            {specs.map(([v, l]) => (
              <div key={l} className="border-t border-gold/40 pt-3">
                <div className="text-cream font-semibold text-lg">{v}</div>
                <div className="text-gold/80 text-xs uppercase tracking-[0.2em] mt-1">{l}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
