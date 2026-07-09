import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Fleur from "@/components/Fleur";

const url = "https://www.skyliverynola.com/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | Sky Livery LLC",
  description:
    "How Sky Livery LLC collects, uses, and protects your personal information. New Orleans luxury SUV service.",
  alternates: { canonical: url },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-cream/60 text-sm text-center mb-12">
            Last updated: July 2026
          </p>

          <div className="text-cream/80 space-y-8 leading-relaxed">
            <section>
              <p>
                Sky Livery LLC respects your privacy. This policy explains what personal information we collect when you book a ride, how we use it, who we share it with, and the choices you have. If anything below is unclear, contact us at <a href="mailto:skyliveryllc@gmail.com" className="text-gold hover:underline">skyliveryllc@gmail.com</a> or (504) 339-6861.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                1. Information we collect
              </h2>
              <p className="mb-3">
                When you book a ride we collect the information you provide directly:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-cream/80">
                <li>Your name and phone number, used to dispatch and reach you on the day of the ride</li>
                <li>Your email address, used to send the booking confirmation, driver assignment, and receipt</li>
                <li>The pickup and drop-off addresses for your ride</li>
                <li>Flight number, if provided, so we can track your arrival at MSY</li>
                <li>Your chosen payment intent (pay online in advance, or pay in the vehicle)</li>
              </ul>
              <p className="mt-3">
                We also automatically log the day and time of your booking, the fare quoted, and internal reference numbers used to look up your trip.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                2. Payment information
              </h2>
              <p>
                Card payments are processed by Square, Inc. Sky Livery never sees or stores your full card number, CVV, or expiration date. Square handles the transaction on their secure servers and sends us only the confirmation that a payment was captured, along with the last four digits of the card for our records. Square&apos;s own privacy practices are described at <a href="https://squareup.com/legal/privacy" target="_blank" rel="noopener" className="text-gold hover:underline">squareup.com/legal/privacy</a>.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                3. How we use your information
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-cream/80">
                <li>Dispatch your chauffeur and vehicle</li>
                <li>Send you booking confirmations, driver assignments, and receipts</li>
                <li>Track your inbound flight so we can adjust pickup time</li>
                <li>Respond to changes, questions, and refund requests</li>
                <li>Keep required business records for tax and licensing compliance</li>
              </ul>
              <p className="mt-3">
                We do <strong className="text-cream">not</strong> sell your information to third parties. We do <strong className="text-cream">not</strong> use your information to run advertising campaigns or send marketing emails unrelated to your bookings.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                4. Third parties we work with
              </h2>
              <p className="mb-3">
                To operate the service we share the minimum information needed with these partners:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-cream/80">
                <li><strong className="text-cream">Square</strong> for card processing and hosted checkout</li>
                <li><strong className="text-cream">Google Maps</strong> for geocoding addresses and calculating driving distance</li>
                <li><strong className="text-cream">Supabase</strong> for encrypted database storage of your booking</li>
                <li><strong className="text-cream">Vercel</strong> for website hosting</li>
                <li><strong className="text-cream">Google (Gmail)</strong> for sending you booking emails from skyliveryllc@gmail.com</li>
                <li>Your <strong className="text-cream">assigned chauffeur</strong>, who receives your name, phone number, pickup and drop-off addresses, and flight number if provided</li>
              </ul>
              <p className="mt-3">
                Each of these providers has its own privacy policy governing how they handle data.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                5. How we protect your information
              </h2>
              <p>
                Traffic between your device and our website is encrypted with HTTPS. Booking records live in Supabase with encryption at rest. Only authenticated dispatch staff can view booking details, and access is logged. We take the security of your information seriously and use industry-standard measures to prevent unauthorized access. No system is perfectly secure, so we also encourage you to protect the email account where your bookings are sent.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                6. How long we keep your information
              </h2>
              <p>
                Booking records are kept for as long as we are required to for tax, regulatory, and business record purposes, typically seven years under Louisiana law. If you want a specific booking removed from our records ahead of that, contact us and we will honor the request unless we are legally required to retain it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                7. Your choices
              </h2>
              <ul className="list-disc pl-5 space-y-1.5 text-cream/80">
                <li>You can request a copy of the information we have on you by emailing skyliveryllc@gmail.com</li>
                <li>You can request corrections or deletions, subject to legal retention obligations</li>
                <li>You can opt out of the driver-assignment email by not providing an email address at booking; a phone call to dispatch is always an option</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                8. Text messaging (SMS)
              </h2>
              <p className="mb-3">
                If you provide a mobile number when booking, or if you are a Sky Livery chauffeur on file with dispatch, you may receive text messages related to your ride or trip assignments: booking confirmations, driver and vehicle assignments, payment links and receipts, and, for chauffeurs, trip offers you can accept or decline by reply.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-cream/80">
                <li><strong className="text-cream">We do not sell or share your mobile number</strong> with third parties for their own marketing purposes. Your number is used only to operate the Sky Livery dispatch service.</li>
                <li>Message frequency varies by activity — typically a small number of messages per ride booked, or per trip offered to chauffeurs.</li>
                <li>Message and data rates may apply, depending on your mobile carrier and plan.</li>
                <li>Reply <strong className="text-cream">STOP</strong> at any time to stop receiving texts from us, or <strong className="text-cream">HELP</strong> for assistance. You can always reach dispatch by phone at (504) 339-6861.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                9. Cookies and tracking
              </h2>
              <p>
                Our website uses only strictly necessary cookies to keep dispatch signed in and to secure the booking form. We do not use advertising cookies or cross-site tracking. If we ever add analytics to help us understand which pages are used, we will use a privacy-friendly, cookieless option.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                10. Children
              </h2>
              <p>
                Our service is intended for adults 18 and older. We do not knowingly collect information from anyone under 13. If you believe a minor has provided us information, contact us and we will delete it.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                11. Changes to this policy
              </h2>
              <p>
                We may revise this policy from time to time. The version in effect at the time of your booking applies. Material changes are noted with a new &ldquo;Last updated&rdquo; date. Continued use of the service after an update means you accept the current policy.
              </p>
            </section>

            <section>
              <h2 className="font-display text-2xl text-cream font-semibold mb-3">
                12. Contact
              </h2>
              <div className="mt-3 p-4 bg-navy/40 border-l-2 border-gold/50 rounded-md">
                <div className="text-cream font-semibold">Sky Livery LLC</div>
                <div className="text-cream/80 text-sm mt-1">
                  New Orleans, LA
                </div>
                <div className="text-cream/80 text-sm">
                  Phone: <a href="tel:+15043396861" className="text-gold hover:underline">(504) 339-6861</a>
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
