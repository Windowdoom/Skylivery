import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur, { FleurIcon } from "@/components/Fleur";
import FadeIn from "@/components/FadeIn";

const url = "https://www.skyliverynola.com/corporate";

export const metadata: Metadata = {
  title: "Corporate Accounts | Sky Livery LLC",
  description:
    "Luxury SUV transportation for New Orleans corporate travel. Monthly invoicing, tax ID on file, PO numbers, dedicated dispatch line, recurring roadshow support.",
  alternates: { canonical: url },
  openGraph: {
    title: "Corporate Accounts | Sky Livery LLC",
    description:
      "Executive luxury SUV service. Monthly invoicing, PO numbers, tax ID on file.",
    url,
    type: "website",
  },
};

const benefits = [
  {
    title: "Monthly invoicing",
    body: "Consolidated invoice at the end of every month. Net 15 or Net 30 terms available. Custom PO numbers accepted on every ride.",
  },
  {
    title: "Dedicated dispatch",
    body: "A direct line for booked accounts, staffed 24/7. Recurring rides, roadshows, and executive itineraries handled by name.",
  },
  {
    title: "Reporting and tax records",
    body: "Itemized statements broken down by cost center or department. Year-end summaries for expense reconciliation and audit.",
  },
  {
    title: "Same trusted chauffeurs",
    body: "Executive-trained drivers with over 45 years of combined experience. Discreet, punctual, and dressed for the occasion.",
  },
];

export default function CorporatePage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16">
        <section className="bg-nola-radial pb-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <FadeIn>
              <Fleur className="mb-8" />
            </FadeIn>
            <FadeIn delay={0.05}>
              <p className="text-[10px] tracking-[0.35em] uppercase text-gold mb-3">
                For Business
              </p>
            </FadeIn>
            <FadeIn delay={0.1}>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-cream font-semibold leading-[1.05] mb-5">
                Corporate accounts.
                <br />
                <span className="italic text-gold">Invoice at month&apos;s end.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p className="text-cream/75 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
                Executive luxury SUV service for New Orleans companies, law firms, event agencies, hotel concierges, and repeat business travel. Open an account once and every ride goes on a monthly bill.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-5 mb-14">
              {benefits.map((b, i) => (
                <FadeIn key={b.title} delay={i * 0.06}>
                  <div className="h-full bg-navy/50 border border-gold/25 rounded-2xl p-6 lift-hover">
                    <div className="flex items-center gap-2 mb-3">
                      <FleurIcon className="w-3 h-4 text-gold" />
                      <p className="text-[10px] tracking-[0.25em] uppercase text-gold">Included</p>
                    </div>
                    <h3 className="font-display text-xl text-cream font-semibold mb-2">
                      {b.title}
                    </h3>
                    <p className="text-cream/70 text-sm leading-relaxed">{b.body}</p>
                  </div>
                </FadeIn>
              ))}
            </div>

            <FadeIn>
              <div className="bg-navy/60 border border-gold/40 rounded-2xl p-8 sm:p-10 text-center max-w-2xl mx-auto">
                <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
                  Open an account
                </p>
                <h2 className="font-display text-3xl text-cream font-semibold mb-4">
                  Book your first corporate ride.
                </h2>
                <p className="text-cream/70 text-sm leading-relaxed mb-6">
                  Tell us about your company. We create your account, send this ride as an invoice, and every future booking goes on the same statement.
                </p>
                <a
                  href="/corporate/book"
                  className="inline-block bg-gold text-navy px-6 py-3 rounded-md font-bold tracking-wide hover:bg-cream transition-colors"
                >
                  Book &amp; open account →
                </a>
                <p className="text-cream/50 text-xs mt-5">
                  Prefer to speak with someone first? Call{" "}
                  <a href="tel:+15043396861" className="text-gold hover:underline">
                    (504) 339-6861
                  </a>{" "}
                  and ask for corporate accounts.
                </p>
              </div>
            </FadeIn>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
