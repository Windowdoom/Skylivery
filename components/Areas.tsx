import FadeIn from "./FadeIn";

const areas = [
  "New Orleans", "Kenner", "Metairie", "French Quarter", "Garden District", "Uptown",
  "CBD / Warehouse", "Bywater", "Marigny", "Lakeview", "Mid-City", "Algiers",
  "Slidell", "Mandeville", "Covington", "Belle Chasse", "Gretna", "Harahan",
];

export default function Areas() {
  return (
    <section id="areas" className="py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-3">Where We Ride</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-4 max-w-2xl">
            Greater New Orleans, gate to gate.
          </h2>
          <p className="text-silver max-w-xl mb-10">
            Based in Kenner, minutes from MSY. We serve every neighborhood on both sides of the lake.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap gap-2">
            {areas.map((a) => (
              <span
                key={a}
                className="px-4 py-2 rounded-full border border-silver/20 text-silver text-sm hover:border-white/40 hover:text-white transition-colors"
              >
                {a}
              </span>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
