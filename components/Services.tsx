import FadeIn from "./FadeIn";

const services = [
  { title: "Airport transfers", desc: "MSY and Lakefront Airport. Flight tracking, meet and greet at arrivals, 30-minute complimentary wait.", link: "/airport-transfer-msy" },
  { title: "Corporate travel", desc: "Executive transportation for meetings, conferences, conventions, and client entertainment.", link: "/corporate-transportation-new-orleans" },
  { title: "Weddings and events", desc: "Arrive in style on your day. Coordinated timing with your planner, pristine vehicle, professional chauffeur.", link: "/wedding-limo-new-orleans" },
  { title: "Mardi Gras and festivals", desc: "Same flat rate during Mardi Gras, Jazz Fest, Essence, and every event. Zero surge.", link: "/mardi-gras-transportation" },
  { title: "Night out", desc: "Skip the parking, skip the DUI risk. Door-to-door luxury for dinner, Bourbon Street, or wherever the night goes.", link: "#book" },
];

export default function Services() {
  return (
    <section id="services" className="bg-navy py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-silver text-xs tracking-[0.2em] uppercase font-semibold text-center mb-2">What we do</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white text-center mb-10">
            Every occasion, one standard
          </h2>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <a href={s.link} className="block bg-white/[0.04] border border-silver/[0.1] rounded-xl p-5 hover:bg-white/[0.06] hover:border-silver/20 transition-all group">
                <h3 className="text-white font-semibold text-sm mb-2 group-hover:text-chrome transition-colors">{s.title}</h3>
                <p className="text-silver/70 text-xs leading-relaxed">{s.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
