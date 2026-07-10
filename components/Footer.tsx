import Image from "next/image";
import { FleurIcon } from "./Fleur";

const year = new Date().getFullYear();

export default function Footer() {
  const yelpUrl = process.env.YELP_URL || process.env.NEXT_PUBLIC_YELP_URL;
  const googlePlaceId = process.env.GOOGLE_PLACE_ID;
  return (
    <footer className="bg-dark border-t border-gold/25 pt-16 pb-8">
      <div className="iron-lace max-w-6xl mx-auto -mt-16 mb-14 opacity-80" aria-hidden="true" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <Image
              src="/logo-emblem.png"
              alt="Sky Livery LLC"
              width={88}
              height={88}
              quality={95}
              className="h-11 w-11 object-contain"
            />
            <div>
              <div className="text-cream font-display text-lg tracking-[0.14em]">Sky Livery</div>
              <div className="text-gold text-[9px] tracking-[0.35em] mt-0.5 flex items-center gap-1">
                <FleurIcon className="w-2 h-2.5" />
                NEW ORLEANS · LOUISIANA
              </div>
            </div>
          </div>
          <p className="text-cream/65 text-sm max-w-sm leading-relaxed mb-6">
            Luxury SUV car service across Greater New Orleans. Flat rates, gratuity included, no surge,
            365 days a year.
          </p>
          <a
            href="/book"
            className="inline-block bg-gold text-navy px-5 py-2.5 rounded-md text-sm font-bold tracking-wide hover:bg-cream transition-colors"
          >
            Book a ride
          </a>
        </div>

        <div>
          <div className="text-gold text-xs uppercase tracking-[0.25em] mb-4">Services</div>
          <ul className="space-y-2 text-cream/75 text-sm">
            <li><a href="/airport-transfer-msy" className="hover:text-gold">Airport transfer (MSY)</a></li>
            <li><a href="/corporate-transportation-new-orleans" className="hover:text-gold">Corporate</a></li>
            <li><a href="/wedding-limo-new-orleans" className="hover:text-gold">Weddings</a></li>
            <li><a href="/mardi-gras-transportation" className="hover:text-gold">Mardi Gras</a></li>
            <li><a href="/corporate" className="hover:text-gold">Corporate accounts</a></li>
            <li><a href="/jazz-fest-transportation" className="hover:text-gold">Jazz Fest</a></li>
          </ul>
        </div>

        <div>
          <div className="text-gold text-xs uppercase tracking-[0.25em] mb-4">Contact</div>
          <ul className="space-y-2 text-cream/75 text-sm">
            <li><a href="tel:+15043396861" className="hover:text-gold">(504) 339-6861 <span className="text-gold/50 text-[10px]">primary</span></a></li>
            <li><a href="tel:+15044790454" className="hover:text-gold">(504) 479-0454</a></li>
            <li><a href="mailto:skyliveryllc@gmail.com" className="hover:text-gold">skyliveryllc@gmail.com</a></li>
            <li>New Orleans, LA</li>
            <li>24/7 dispatch</li>
          </ul>
        </div>

        {(yelpUrl || googlePlaceId) && (
          <div>
            <div className="text-gold text-xs uppercase tracking-[0.25em] mb-4">Reviews</div>
            <ul className="space-y-2 text-cream/75 text-sm">
              {googlePlaceId && (
                <li>
                  <a
                    href={`https://search.google.com/local/writereview?placeid=${googlePlaceId}`}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-gold"
                  >
                    Review us on Google
                  </a>
                </li>
              )}
              {yelpUrl && (
                <li>
                  <a href={yelpUrl} target="_blank" rel="noopener" className="hover:text-gold">
                    Review us on Yelp
                  </a>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-6 border-t border-gold/15 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-silver/70 text-xs tracking-wide">
          © {year} <span className="text-silver font-semibold tracking-[0.15em]">SKY LIVERY LLC</span> · Licensed and insured · New Orleans
        </p>
        <div className="flex items-center gap-4 text-xs">
          <a href="/terms" className="text-cream/60 hover:text-gold">Terms</a>
          <a href="/privacy" className="text-cream/60 hover:text-gold">Privacy</a>
          <p className="text-gold/70 italic font-display">Arrive like you own the city.</p>
        </div>
      </div>
      <p className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 text-cream/35 text-[11px] leading-relaxed">
        Sky Livery operates under a local chauffeur permit and abides by the laws, rules, and licensing requirements of the City of New Orleans and MSY, serving the Greater New Orleans area, including the North Shore, Kenner, Metairie, and airport transfers to and from MSY. We are not an intercity or interstate carrier. Service outside our local area is offered at our discretion, not guaranteed, and our certified area will expand over time.
      </p>
    </footer>
  );
}
