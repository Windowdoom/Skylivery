import FadeIn from "./FadeIn";

const areas = [
  { name: "MSY Airport", desc: "Louis Armstrong International. Meet and greet at arrivals, flight tracking, complimentary wait.", link: "/airport-transfer-msy" },
  { name: "French Quarter and Marigny", desc: "Bourbon St, Jackson Square, Royal St, Frenchmen St. We know the one-way streets.", link: "/french-quarter-car-service" },
  { name: "CBD and Warehouse District", desc: "Convention Center, Superdome, all downtown hotels and offices.", link: "#book" },
  { name: "Garden District and Uptown", desc: "Magazine St, St. Charles Ave, Audubon, Tulane, Loyola.", link: "/garden-district-car-service" },
  { name: "Metairie and Kenner", desc: "Causeway to Clearview, Veterans corridor, all of Jefferson Parish.", link: "/metairie-car-service" },
  { name: "Northshore", desc: "Mandeville, Covington, Slidell via Causeway or I-12.", link: "#book" },
];

export default function Areas() {
  return (
    <section id="areas" className="bg-off-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-navy-light text-xs tracking-[0.2em] uppercase font-semibold text-center mb-2">Where we ride</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy text-center mb-10">Service areas</h2>
        </FadeIn>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((a, i) => (
            <FadeIn key={i} delay={i * 0.05}>
              <a href={a.link} className="block bg-white rounded-xl p-5 border border-silver/[0.08] hover:border-navy/10 hover:shadow-sm transition-all">
                <h3 className="text-navy font-semibold text-sm mb-1">{a.name}</h3>
                <p className="text-silver text-xs leading-relaxed">{a.desc}</p>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
