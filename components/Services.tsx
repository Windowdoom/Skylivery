import FadeIn from "./FadeIn";
import Fleur from "./Fleur";

const services = [
  {
    title: "Airport Transfers",
    tag: "MSY · $105 flat",
    desc: "Flight tracked. Meet & greet at baggage claim. Straight to your hotel or home.",
    href: "/airport-transfer-msy",
  },
  {
    title: "Corporate Travel",
    tag: "Monthly billing",
    desc: "Executive rides, roadshows, client entertainment. Discreet, on time, invoiced.",
    href: "/corporate-transportation-new-orleans",
  },
  {
    title: "Weddings & Events",
    tag: "Full-day charter",
    desc: "Bride, party, and family. One chauffeur, all night, black tie on request.",
    href: "/wedding-limo-new-orleans",
  },
  {
    title: "Night in the Quarter",
    tag: "Point-to-point",
    desc: "Dinner at Antoine&apos;s, jazz on Frenchmen, home before you notice.",
    href: "/french-quarter-car-service",
  },
  {
    title: "Mardi Gras & Jazz Fest",
    tag: "0% surge, guaranteed",
    desc: "Same rate on Fat Tuesday as any day. We know the closures.",
    href: "/mardi-gras-transportation",
  },
  {
    title: "Hourly Charter",
    tag: "$85 / hr",
    desc: "Your driver, your itinerary. Three-hour weekday, four-hour weekend minimum.",
    href: "/book",
  },
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Fleur className="mb-8" />
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold text-center mb-3">Services</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold text-center max-w-2xl mx-auto mb-14">
            Luxury SUV service. <span className="italic text-gold">For every occasion.</span>
          </h2>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <a
                href={s.href}
                className="group block h-full bg-navy/40 border border-gold/20 rounded-xl p-6 hover:border-gold/60 hover:bg-navy/60 hover:shadow-brass transition-all"
              >
                <div className="flex items-baseline justify-between mb-3">
                  <h3 className="font-display text-xl text-cream font-semibold">{s.title}</h3>
                </div>
                <span className="inline-block text-[10px] tracking-[0.2em] uppercase text-gold border border-gold/40 rounded-full px-2.5 py-1 mb-4">
                  {s.tag}
                </span>
                <p className="text-cream/70 text-sm leading-relaxed mb-5">{s.desc}</p>
                <span className="text-gold text-xs font-semibold tracking-[0.15em] uppercase group-hover:underline">
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
