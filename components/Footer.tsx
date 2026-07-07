import { FleurIcon } from "./Fleur";

const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-gold/25 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Sky Livery LLC" className="h-11 w-11" />
            <div>
              <div className="text-cream font-display text-lg tracking-[0.14em]">Sky Livery</div>
              <div className="text-gold text-[9px] tracking-[0.35em] mt-0.5 flex items-center gap-1">
                <FleurIcon className="w-2 h-2.5" />
                KENNER · LOUISIANA
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
            <li><a href="/jazz-fest-transportation" className="hover:text-gold">Jazz Fest</a></li>
          </ul>
        </div>

        <div>
          <div className="text-gold text-xs uppercase tracking-[0.25em] mb-4">Contact</div>
          <ul className="space-y-2 text-cream/75 text-sm">
            <li><a href="tel:+15044790454" className="hover:text-gold">(504) 479-0454</a></li>
            <li><a href="mailto:info@skylivery.llc" className="hover:text-gold">info@skylivery.llc</a></li>
            <li>Kenner, LA 70062</li>
            <li>24/7 dispatch</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-6 border-t border-gold/15 flex flex-col sm:flex-row justify-between items-center gap-3">
        <p className="text-cream/50 text-xs">
          © {year} Sky Livery LLC · CPNC licensed, City of New Orleans, Sec. 162-841 · Fully insured
        </p>
        <p className="text-gold/70 text-xs italic font-display">Arrive like you own the city.</p>
      </div>
    </footer>
  );
}
