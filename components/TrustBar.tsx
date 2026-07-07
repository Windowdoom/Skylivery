const signals = ["CPNC licensed", "$1M insured", "No surge pricing", "Gratuity included", "162-841 compliant"];

export default function TrustBar() {
  return (
    <div className="bg-white py-5 px-4 border-y border-off-white">
      <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-x-8 gap-y-2">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-silver font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
