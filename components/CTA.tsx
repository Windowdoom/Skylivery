import FadeIn from "./FadeIn";
import Fleur from "./Fleur";

export default function CTA() {
  return (
    <section className="py-28 relative overflow-hidden bg-nola-radial">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-gold/[0.06] blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <FadeIn>
          <Fleur className="mb-8" />
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-4">Ready when you are</p>
          <h2 className="font-display text-4xl sm:text-5xl text-cream font-semibold mb-4">
            Ready to <span className="italic text-gold">ride?</span>
          </h2>
          <p className="text-cream/70 text-lg mb-10 max-w-xl mx-auto">
            Get a flat-rate quote in seconds. Or call us. We dispatch 24 hours a day, seven days a week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/book"
              className="bg-gold text-navy px-8 py-4 rounded-lg font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all"
            >
              Book a ride
            </a>
            <a
              href="tel:+15040000000"
              className="border border-gold/50 text-cream px-8 py-4 rounded-lg font-semibold hover:bg-gold/5 hover:border-gold transition-colors"
            >
              (504) 000-0000
            </a>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
