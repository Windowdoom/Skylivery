import FadeIn from "./FadeIn";

export default function CTA() {
  return (
    <section className="bg-navy py-14 sm:py-16 px-4 text-center">
      <FadeIn>
        <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Ready to ride?</h2>
        <p className="text-silver text-sm mb-6">Book online or call us. Same flat rate either way.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <a href="#book" className="bg-white text-navy px-8 py-3.5 rounded-lg text-base font-bold hover:scale-[1.02] transition-transform">
            Book now
          </a>
          <a href="tel:5040000000" className="text-white px-8 py-3.5 rounded-lg text-base font-medium border border-silver/20 hover:border-silver/40 transition-colors">
            (504) 000-0000
          </a>
          <a href="sms:5040000000" className="text-white px-8 py-3.5 rounded-lg text-base font-medium border border-silver/20 hover:border-silver/40 transition-colors">
            Text us
          </a>
        </div>
      </FadeIn>
    </section>
  );
}
