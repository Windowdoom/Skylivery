import FadeIn from "./FadeIn";
import Fleur from "./Fleur";

const items = [
  { title: "All-inclusive pricing", desc: "The number you see is the number you pay." },
  { title: "No surge, ever", desc: "Same rate on Fat Tuesday as any Tuesday." },
  { title: "Flight tracking", desc: "We watch your inbound flight and adjust automatically." },
  { title: "Professional chauffeur", desc: "Vetted, licensed, dressed for business." },
  { title: "Door-to-door", desc: "Meet & greet, luggage, curbside — every time." },
  { title: "24/7 dispatch", desc: "Real humans answering the phone, any hour." },
];

export default function WhySection() {
  return (
    <section className="py-24 bg-dark relative">
      <div className="absolute inset-x-0 top-0 h-px bg-brass-line opacity-40" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <Fleur className="mb-8" />
        </FadeIn>
        <FadeIn delay={0.05}>
          <p className="text-[10px] tracking-[0.3em] uppercase text-gold text-center mb-3">
            Why Sky Livery
          </p>
          <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold text-center max-w-2xl mx-auto mb-14">
            Everything you&apos;d expect from a premium car service.
            <span className="italic text-gold"> Nothing you wouldn&apos;t.</span>
          </h2>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 lg:gap-8">
          {items.map((it, i) => (
            <FadeIn key={it.title} delay={i * 0.05}>
              <div className="border-l-2 border-gold/60 pl-4 hover:border-gold transition-colors">
                <h3 className="text-cream font-semibold text-base">{it.title}</h3>
                <p className="text-cream/65 text-sm mt-1.5 leading-relaxed">{it.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-px bg-brass-line opacity-40" />
    </section>
  );
}
