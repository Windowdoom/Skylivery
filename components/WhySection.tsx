import FadeIn from "./FadeIn";

const items = [
  { title: "All-inclusive pricing", desc: "The price you see is the price you pay." },
  { title: "No surge, ever", desc: "Same rate 365 days a year." },
  { title: "Flight tracking", desc: "We watch your flight and adjust." },
  { title: "Professional chauffeur", desc: "Vetted, licensed, dressed for business." },
  { title: "Door-to-door", desc: "Meet & greet, luggage, curbside." },
  { title: "24/7 availability", desc: "Anytime, any day, real humans." },
];

export default function WhySection() {
  return (
    <section className="py-20 border-y border-silver/10 bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-3">Why Sky Livery</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-12 max-w-2xl">
            Everything you&apos;d expect from a premium car service. Nothing you wouldn&apos;t.
          </h2>
        </FadeIn>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((it, i) => (
            <FadeIn key={it.title} delay={i * 0.05}>
              <div className="border-l border-silver/25 pl-4">
                <h3 className="text-white font-semibold text-sm sm:text-base">{it.title}</h3>
                <p className="text-silver text-sm mt-1 leading-relaxed">{it.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
