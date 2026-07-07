import { FleurIcon } from "./Fleur";

const items = [
  "CPNC Licensed",
  "Fully Insured",
  "No Surge Pricing",
  "Gratuity Included",
  "Sec. 162-841 Compliant",
];

export default function TrustBar() {
  return (
    <section className="border-y border-gold/25 bg-navy">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap justify-center items-center gap-x-8 gap-y-3">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-2 text-cream/85 text-xs uppercase tracking-[0.2em]">
            <FleurIcon className="w-2.5 h-3 text-gold" />
            <span>{it}</span>
            {i < items.length - 1 && (
              <span className="hidden sm:inline w-1 h-1 rounded-full bg-gold/40 ml-4" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
