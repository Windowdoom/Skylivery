const items = [
  "CPNC Licensed",
  "$1M Insured",
  "No Surge Pricing",
  "Gratuity Included",
  "Sec. 162-841 Compliant",
];

export default function TrustBar() {
  return (
    <section className="border-y border-silver/15 bg-dark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap justify-center gap-x-8 gap-y-3">
        {items.map((it, i) => (
          <div key={it} className="flex items-center gap-3 text-silver text-xs uppercase tracking-[0.2em]">
            <span className="text-white">✓</span>
            {it}
            {i < items.length - 1 && <span className="hidden sm:inline w-1 h-1 rounded-full bg-silver/30 ml-5" />}
          </div>
        ))}
      </div>
    </section>
  );
}
