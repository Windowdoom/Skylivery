import FadeIn from "./FadeIn";

const benefits = [
  { title: "All-inclusive pricing", desc: "Gratuity, tolls, and fees included in your flat rate" },
  { title: "No surge, ever", desc: "Same price Mardi Gras, Jazz Fest, Saints game day" },
  { title: "Flight tracking", desc: "We monitor your flight and adjust pickup time automatically" },
  { title: "Professional chauffeur", desc: "Licensed, background-checked, uniformed drivers" },
  { title: "Door-to-door", desc: "Meet and greet at MSY arrivals or your exact address" },
  { title: "24/7 availability", desc: "Early morning pickups, late night returns, we never close" },
];

export default function WhySection() {
  return (
    <section className="bg-off-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy text-center mb-3">
            Why Sky Livery
          </h2>
          <p className="text-silver text-sm text-center mb-10 max-w-lg mx-auto">
            We built this service around what passengers actually care about.
          </p>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((b, i) => (
            <FadeIn key={i} delay={i * 0.06}>
              <div className="bg-white rounded-xl p-5 border border-silver/[0.1] hover:border-navy/10 hover:shadow-sm transition-all">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mb-3" />
                <h3 className="text-navy font-semibold text-sm mb-1">{b.title}</h3>
                <p className="text-silver text-xs leading-relaxed">{b.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
