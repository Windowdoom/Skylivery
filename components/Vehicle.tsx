import FadeIn from "./FadeIn";

export default function Vehicle() {
  return (
    <section id="vehicle" className="bg-white py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <FadeIn>
          <p className="text-navy-light text-xs tracking-[0.2em] uppercase font-semibold text-center mb-2">The vehicle</p>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-navy text-center mb-10">Luxury SUV</h2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <div className="bg-off-white rounded-2xl p-8 sm:p-10 border border-silver/[0.08]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: "Passengers", value: "Up to 6" },
                { label: "Luggage", value: "6 bags" },
                { label: "Interior", value: "Leather, climate controlled" },
                { label: "Amenities", value: "Charging, water, Wi-Fi" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-lg p-4">
                  <p className="text-silver text-[10px] uppercase tracking-wider">{s.label}</p>
                  <p className="text-navy font-semibold text-sm mt-1">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-silver text-sm leading-relaxed mb-6">
              Full-size luxury SUV. Professional chauffeur, spotless interior, on time every time. Whether it is an airport pickup at MSY, a ride to the French Quarter, or an hourly charter for a wedding or corporate event, the vehicle and the service match the destination.
            </p>
            <a href="#book" className="inline-block bg-navy text-white px-7 py-3 rounded-lg text-sm font-bold hover:bg-navy-light transition-colors">
              Book your ride
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
