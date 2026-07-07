import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-navy to-dark" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-white/[0.03] blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-4">Ready when you are</p>
          <h2 className="font-display text-4xl sm:text-5xl text-white font-semibold mb-6">
            Ready to ride?
          </h2>
          <p className="text-silver text-lg mb-10 max-w-xl mx-auto">
            Get a flat-rate quote in seconds. Or pick up the phone — we&apos;re dispatch 24/7.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/#book"
              className="bg-white text-navy px-8 py-4 rounded-lg font-bold hover:scale-[1.03] transition-transform"
            >
              Book now
            </a>
            <a
              href="tel:+15040000000"
              className="border border-silver/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/5 transition-colors"
            >
              (504) 000-0000
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
