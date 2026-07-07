import FadeIn from "./FadeIn";
import BookingForm from "./BookingForm";

export default function Hero() {
  return (
    <section id="book" className="relative min-h-screen flex items-center bg-gradient-to-br from-dark via-navy to-navy-light overflow-hidden">
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 80px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 80px)"
      }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-28 sm:py-32 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left copy */}
          <div>
            <FadeIn>
              <p className="text-silver text-xs tracking-[0.2em] uppercase font-semibold mb-4">
                Luxury SUV service, New Orleans
              </p>
            </FadeIn>
            <FadeIn delay={0.08}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] mb-5">
                Arrive like you<br />own the city.
              </h1>
            </FadeIn>
            <FadeIn delay={0.16}>
              <p className="text-silver text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Flat-rate luxury SUV service across Greater New Orleans. Gratuity included in every fare. No surge. No hidden fees. MSY airport to anywhere.
              </p>
            </FadeIn>
            <FadeIn delay={0.24}>
              <div className="flex gap-8 sm:gap-10">
                {[
                  { val: "$105", label: "MSY to French Quarter" },
                  { val: "24/7", label: "Every day of the year" },
                  { val: "0%", label: "Surge pricing, ever" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-xl sm:text-2xl font-bold text-white">{s.val}</div>
                    <div className="text-xs text-silver mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>

          {/* Right booking form */}
          <FadeIn delay={0.12}>
            <BookingForm />
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
