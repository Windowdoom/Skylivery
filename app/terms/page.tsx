import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur from "@/components/Fleur";

const url = "https://www.skyliverynola.com/terms";

export const metadata: Metadata = {
  title: "Terms of Service | Sky Livery LLC",
  description:
    "Terms and conditions for Sky Livery LLC, a New Orleans luxury SUV service. Booking, payment, cancellation, and refund policy.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main className="pt-28 pb-16 bg-nola-radial">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Fleur className="mb-8" />
          <p className="text-[10px] tracking-[0.35em] uppercase text-gold text-center mb-3">
            Legal
          </p>
          <h1 className="font-display text-4xl sm:text-5xl text-cream font-semibold text-center mb-2">
            Terms of Service
          </h1>
          <p className="text-cream/60 text-sm text-center mb-12">
            Last updated: July 2026
          </p>

          <div className="text-cream/80 space-y-8 leading-relaxed">
            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                1. Who we are
              </h2>
              <p>
                Sky Livery LLC (&ldquo;Sky Livery,&rdquo; &ldquo;we,&rdquo; &ldquo;our&rdquo;) is a licensed and insured luxury SUV chauffeur service serving the New Orleans area. We provide airport transfers, corporate transportation, weddings, hourly charter, and event transportation within our permitted local service area. By booking a ride with us, whether through the website at skyliverynola.com or by calling dispatch, you agree to the terms below.
              </p>
              <p className="mt-3">
                Sky Livery operates under a local New Orleans-area chauffeur permit covering trips within the Greater New Orleans area, including the North Shore, Kenner, and Metairie. This includes transfers to and from Louis Armstrong New Orleans International Airport (MSY), which fall within that local jurisdiction. Sky Livery does not hold itself out as an intercity or interstate common carrier, and nothing on this site or in our marketing should be read as an offer of intercity, intrastate, or interstate transportation requiring separate state or federal authorization. Any trip outside our local service area is offered at our discretion on a case-by-case basis and is not a standing service. We plan to expand our certified service area over time; this policy will be updated when that happens.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                2. Bookings and rates
              </h2>
              <p>
                Rates are provided at time of booking based on pickup and drop-off location, vehicle, and service duration. Every quote is all-inclusive: <strong className="text-cream">gratuity is included</strong>, taxes are included, and there is no surge pricing on holidays, festivals, or peak weekends. A booking is confirmed once you receive a reference number in the format SL-YYYY-XXXXX by email, text, or on the confirmation screen. Sky Livery reserves the right to decline any booking that presents a safety concern or cannot be reasonably staffed.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                3. Payment
              </h2>
              <p>
                You may pay in advance by clicking the secure Square payment link included in your confirmation, or in the vehicle at drop-off using card or cash. All electronic payments are processed by Square, Inc. Sky Livery does not store your card number on our servers. Your booking reference appears on the receipt Square sends automatically and on the receipt Sky Livery sends by email.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                4. Cancellation and refund policy
              </h2>
              <p>
                We keep this simple:
              </p>
              <div className="my-4 bg-navy/40 border border-gold/25 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-navy/60">
                    <tr className="text-gold text-[10px] tracking-[0.2em] uppercase text-left">
                      <th className="p-3">Cancellation Timing</th>
                      <th className="p-3 text-right">Charge</th>
                    </tr>
                  </thead>
                  <tbody className="text-cream/80">
                    <tr className="border-t border-gold/10">
                      <td className="p-3">2 or more hours before pickup</td>
                      <td className="p-3 text-right text-gold font-semibold">
                        Full refund
                      </td>
                    </tr>
                    <tr className="border-t border-gold/10">
                      <td className="p-3">
                        Less than 2 hours before pickup
                      </td>
                      <td className="p-3 text-right text-gold font-semibold">
                        Full fare, no refund
                      </td>
                    </tr>
                    <tr className="border-t border-gold/10">
                      <td className="p-3">No-show at pickup</td>
                      <td className="p-3 text-right text-gold font-semibold">
                        Full fare, no refund
                      </td>
                    </tr>
                    <tr className="border-t border-gold/10">
                      <td className="p-3">
                        Inclement weather or unsafe conditions
                      </td>
                      <td className="p-3 text-right text-gold font-semibold">
                        Full refund at Sky Livery&apos;s discretion
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>
                <strong className="text-cream">Weather clause.</strong> If dispatch determines that road or storm conditions make the trip unsafe, we issue a full refund even inside the 2-hour window. To request a cancellation or refund, reply to your confirmation email or call dispatch. Approved refunds are issued to the original payment method and typically arrive within 5 to 7 business days.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                5. Wait time
              </h2>
              <p>
                We include 30 minutes of complimentary wait time at every pickup, including airport arrivals with baggage claim and customs delays. Beyond 30 minutes past the scheduled pickup, additional wait time is billed at <strong className="text-cream">$1.00 per minute</strong> and added to the final fare by dispatch.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                6. Additional fees
              </h2>
              <p>
                Additional fees may apply for extended distance, out-of-state travel, or extended wait time. Any such fees are disclosed to you before the trip is confirmed. Certain long-distance trips require a custom quote from dispatch rather than an online rate.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                7. Vehicles and passengers
              </h2>
              <p>
                Our fleet consists of full-size luxury SUVs seating up to seven passengers with room for six standard bags. Child car seats are the responsibility of the passenger unless arranged in advance. Sky Livery is not responsible for personal belongings left in the vehicle after drop-off; contact dispatch and we will make every reasonable effort to return them.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                8. Conduct
              </h2>
              <p>
                We reserve the right to refuse or terminate service to any passenger who is disrespectful to our chauffeurs, damages the vehicle, or violates local, state, or federal law. Smoking of any kind is prohibited in our vehicles. Damage to the interior beyond normal use, including cleaning fees for spills or sickness, may be charged to the payment method on file.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                9. Liability
              </h2>
              <p>
                Sky Livery carries commercial livery insurance meeting or exceeding Louisiana state requirements. Our liability is limited to the fare paid and applicable insurance coverage. Sky Livery is not responsible for delays caused by weather, traffic, road closures, mechanical issues beyond our control, or acts of third parties. We will always make reasonable efforts to notify you promptly and offer alternatives.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                10. Text messaging
              </h2>
              <p>
                By providing your mobile number when booking, or by being a chauffeur on file with Sky Livery dispatch, you consent to receive text messages related to your ride or your trip assignments, including booking confirmations, driver and vehicle assignments, payment links, receipts, and (for chauffeurs) trip offers. Message frequency varies with activity. Message and data rates may apply. Reply <strong className="text-cream">STOP</strong> to opt out at any time or <strong className="text-cream">HELP</strong> for assistance. See our <a href="/privacy" className="text-gold hover:underline">Privacy Policy</a> for how we handle your mobile number.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                11. Changes to these terms
              </h2>
              <p>
                We may update these terms occasionally. The version in effect at the time of your booking is the version that applies. Material changes are noted with a new &ldquo;Last updated&rdquo; date at the top of this page. Continued use of our service after an update constitutes acceptance of the current terms.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                12. Governing law and contact
              </h2>
              <p>
                These terms are governed by the laws of the State of Louisiana. Any disputes will be resolved in the courts of Orleans Parish, Louisiana. For any questions about this policy or a specific booking, contact:
              </p>
              <div className="mt-3 p-4 bg-navy/40 border-l-2 border-gold/50 rounded-md">
                <div className="text-cream font-semibold">Sky Livery LLC</div>
                <div className="text-cream/80 text-sm mt-1">New Orleans, LA</div>
                <div className="text-cream/80 text-sm">
                  Phone: <a href="tel:+15043396861" className="text-gold hover:underline">(504) 339-6861</a> · Backup: <a href="tel:+15044790454" className="text-gold hover:underline">(504) 479-0454</a>
                </div>
                <div className="text-cream/80 text-sm">
                  Email: <a href="mailto:skyliveryllc@gmail.com" className="text-gold hover:underline">skyliveryllc@gmail.com</a>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
