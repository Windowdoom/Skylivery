import Navbar from "./Navbar";
import BookingForm from "./BookingForm";
import TrustBar from "./TrustBar";
import CTA from "./CTA";
import Footer from "./Footer";
import FadeIn from "./FadeIn";

type Props = {
  eyebrow: string;
  h1: string;
  intro: string;
  highlights: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
};

export default function LandingPage({ eyebrow, h1, intro, highlights, faqs }: Props) {
  return (
    <>
      <Navbar />
      <main>
        <section className="relative pt-28 pb-16">
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-navy via-navy to-dark" />
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <FadeIn>
                <span className="text-[10px] tracking-[0.3em] uppercase text-silver">{eyebrow}</span>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.05]">
                  {h1}
                </h1>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="mt-6 text-silver text-base sm:text-lg max-w-xl leading-relaxed">{intro}</p>
              </FadeIn>
              <FadeIn delay={0.25}>
                <div className="mt-10 grid sm:grid-cols-2 gap-5">
                  {highlights.map((h) => (
                    <div key={h.title} className="border-l border-silver/25 pl-4">
                      <h3 className="text-white font-semibold">{h.title}</h3>
                      <p className="text-silver text-sm mt-1 leading-relaxed">{h.body}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-2">
              <FadeIn delay={0.15} y={30}>
                <BookingForm />
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-20 bg-dark border-y border-silver/10">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <p className="text-[10px] tracking-[0.3em] uppercase text-silver mb-3">Common Questions</p>
              <h2 className="font-display text-3xl sm:text-4xl text-white font-semibold mb-10">
                Answered upfront.
              </h2>
            </FadeIn>
            <div className="space-y-6">
              {faqs.map((f, i) => (
                <FadeIn key={f.q} delay={i * 0.05}>
                  <div className="border-t border-silver/15 pt-5">
                    <h3 className="text-white font-semibold mb-2">{f.q}</h3>
                    <p className="text-silver text-sm leading-relaxed">{f.a}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <TrustBar />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
