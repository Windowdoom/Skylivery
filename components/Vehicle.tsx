import FadeIn from "./FadeIn";

const specs = [
  ["6", "Passengers"],
  ["6", "Bags"],
  ["Leather", "Interior"],
  ["Climate", "Dual-zone"],
  ["USB-C", "Charging"],
  ["Water", "Complimentary"],
];

export default function Vehicle() {
  return (
    <section id="vehicle" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <FadeIn>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-silver/15 bg-gradient-to-br from-white/[0.04] to-white/[0.01] flex items-center justify-center">
            <img src="/logo.png" alt="Sky Livery LLC luxury SUV" className="w-2/3 max-w-sm opacity-90" />
            <div className="absolute bottom-4 left-4 text-[10px] tracking-[0.3em] uppercase text-silver">
              Chevrolet Suburban · Black
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-3">The Vehicle</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-4">
            One vehicle. Fully outfitted.
          </h2>
          <p className="text-silver text-base leading-relaxed mb-8 max-w-lg">
            A full-size luxury SUV built for six adults and six bags. Detailed daily, staged discreetly, and
            driven by a professional chauffeur.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {specs.map(([v, l]) => (
              <div key={l} className="border-t border-silver/20 pt-3">
                <div className="text-white font-semibold text-lg">{v}</div>
                <div className="text-silver text-xs uppercase tracking-widest mt-1">{l}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
