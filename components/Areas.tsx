import FadeIn from "./FadeIn";
import Fleur from "./Fleur";

const areas = [
  "New Orleans", "Kenner", "Metairie", "French Quarter", "Garden District", "Uptown",
  "CBD / Warehouse", "Bywater", "Marigny", "Lakeview", "Mid-City", "Algiers",
  "Slidell", "Mandeville", "Covington", "Belle Chasse", "Gretna", "Harahan",
];

export default function Areas() {
  return (
    <section id="areas" className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Fleur className="mb-8" />
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold text-center mb-3">Where We Ride</p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold text-center max-w-2xl mx-auto mb-4">
            Greater New Orleans, <span className="italic text-gold">gate to gate.</span>
          </h2>
          <p className="text-cream/65 max-w-xl mx-auto text-center mb-12">
            Based in Kenner, minutes from MSY. We serve every neighborhood on both sides of the lake.
          </p>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {areas.map((a) => (
              <span
                key={a}
                className="px-4 py-2 rounded-full border border-gold/25 text-cream/80 text-sm hover:border-gold hover:text-gold hover:bg-gold/5 transition-all"
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
