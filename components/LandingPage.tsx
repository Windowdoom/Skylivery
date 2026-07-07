import Navbar from "./Navbar";
import BookingForm, { BookingContext } from "./BookingForm";
import TrustBar from "./TrustBar";
import CTA from "./CTA";
import Footer from "./Footer";
import FadeIn from "./FadeIn";
import Fleur, { FleurIcon } from "./Fleur";

type Props = {
  eyebrow: string;
  h1: string;
  intro: string;
  highlights: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  bookingContext?: BookingContext;
  schema?: object;
};

export default function LandingPage({
  eyebrow,
  h1,
  intro,
  highlights,
  faqs,
  bookingContext,
  schema,
}: Props) {
  return (
    <>
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      )}
      <Navbar />
      <main>
        <section className="relative pt-28 pb-16 bg-nola-radial overflow-hidden">
          <div className="absolute inset-0 -z-10 pointer-events-none">
            <div className="absolute -top-40 -left-32 w-[600px] h-[600px] rounded-full bg-gold/[0.06] blur-3xl" />
            <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] rounded-full bg-wine/[0.10] blur-3xl" />
          </div>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-5 gap-10 items-start">
            <div className="lg:col-span-3">
              <FadeIn>
                <span className="inline-flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase text-gold">
                  <FleurIcon className="w-3 h-4" />
                  {eyebrow}
                </span>
              </FadeIn>
              <FadeIn delay={0.05}>
                <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-semibold text-cream leading-[1.03]">
                  {h1}
                </h1>
              </FadeIn>
              <FadeIn delay={0.15}>
                <p className="mt-6 text-cream/75 text-base sm:text-lg max-w-xl leading-relaxed">{intro}</p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <a
                    href="/book"
                    className="bg-gold text-navy px-6 py-3 rounded-md font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all inline-block text-center"
                  >
                    Book a ride
                  </a>
                  <a
                    href="tel:+15044790454"
                    className="border border-gold/40 text-cream px-6 py-3 rounded-md font-semibold hover:bg-gold/5 hover:border-gold transition-colors inline-block text-center"
                  >
                    (504) 479-0454
                  </a>
                </div>
              </FadeIn>
              <FadeIn delay={0.25}>
                <div className="mt-10 grid sm:grid-cols-2 gap-5">
                  {highlights.map((h) => (
                    <div key={h.title} className="border-l-2 border-gold/60 pl-4">
                      <h3 className="text-cream font-semibold">{h.title}</h3>
                      <p className="text-cream/65 text-sm mt-1 leading-relaxed">{h.body}</p>
                    </div>
                  ))}
                </div>
              </FadeIn>
            </div>
            <div className="lg:col-span-2">
              <FadeIn delay={0.15} y={30}>
                <BookingForm context={bookingContext} />
              </FadeIn>
            </div>
          </div>
        </section>

        <section className="py-20 bg-dark border-y border-gold/15">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <Fleur className="mb-8" />
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold text-center mb-3">
                Common Questions
              </p>
              <h2 className="font-display text-3xl sm:text-4xl text-cream font-semibold text-center mb-12">
                Answered upfront.
              </h2>
            </FadeIn>
            <div className="space-y-6">
              {faqs.map((f, i) => (
                <FadeIn key={f.q} delay={i * 0.05}>
                  <div className="border-t border-gold/25 pt-5">
                    <h3 className="text-cream font-semibold mb-2">{f.q}</h3>
                    <p className="text-cream/70 text-sm leading-relaxed">{f.a}</p>
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
