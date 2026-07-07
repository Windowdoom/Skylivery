import FadeIn from "./FadeIn";

const services = [
  {
    title: "Airport Transfers",
    desc: "Flat-rate MSY pickup or drop-off. Flight tracked. Meet & greet at baggage claim.",
    href: "/airport-transfer-msy",
  },
  {
    title: "Corporate Travel",
    desc: "Executive rides, roadshows, client entertainment. Discreet, on time, invoiced.",
    href: "/corporate-transportation-new-orleans",
  },
  {
    title: "Weddings & Events",
    desc: "Wedding party transport, rehearsals, receptions. Chauffeur in black tie on request.",
    href: "/wedding-limo-new-orleans",
  },
  {
    title: "Night Out",
    desc: "Dinner in the Quarter, jazz on Frenchmen, home before you notice.",
    href: "/french-quarter-car-service",
  },
  {
    title: "Hourly Charter",
    desc: "$85/hr, 3-hour minimum weekdays, 4-hour weekends. Your driver, your itinerary.",
    href: "/#book",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 bg-dark border-y border-silver/10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-3">Services</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-12 max-w-2xl">
            One SUV. Every occasion that matters.
          </h2>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <a
                href={s.href}
                className="group block h-full bg-white/[0.02] border border-silver/[0.12] rounded-xl p-6 hover:border-white/25 hover:bg-white/[0.04] transition-all"
              >
                <h3 className="font-display text-xl text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-silver text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="text-white text-xs font-semibold tracking-widest uppercase group-hover:underline">
                  Book now →
                </span>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
