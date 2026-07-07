const year = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-dark border-t border-silver/15 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <img src="/logo.png" alt="Sky Livery LLC" className="h-10 w-10" />
            <div>
              <div className="text-white font-bold tracking-[0.2em]">SKY LIVERY</div>
              <div className="text-silver text-[10px] tracking-[0.3em]">LLC · KENNER, LA</div>
            </div>
          </div>
          <p className="text-silver text-sm max-w-sm leading-relaxed">
            Luxury SUV car service across Greater New Orleans. Flat rates, gratuity included, no surge —
            365 days a year.
          </p>
        </div>

        <div>
          <div className="text-white text-xs uppercase tracking-[0.2em] mb-4">Services</div>
          <ul className="space-y-2 text-silver text-sm">
            <li><a href="/airport-transfer-msy" className="hover:text-white">Airport transfer (MSY)</a></li>
            <li><a href="/corporate-transportation-new-orleans" className="hover:text-white">Corporate</a></li>
            <li><a href="/wedding-limo-new-orleans" className="hover:text-white">Weddings</a></li>
            <li><a href="/mardi-gras-transportation" className="hover:text-white">Mardi Gras</a></li>
            <li><a href="/jazz-fest-transportation" className="hover:text-white">Jazz Fest</a></li>
          </ul>
        </div>

        <div>
          <div className="text-white text-xs uppercase tracking-[0.2em] mb-4">Contact</div>
          <ul className="space-y-2 text-silver text-sm">
            <li><a href="tel:+15040000000" className="hover:text-white">(504) 000-0000</a></li>
            <li><a href="mailto:info@skylivery.llc" className="hover:text-white">info@skylivery.llc</a></li>
            <li>Kenner, LA</li>
            <li>24/7 dispatch</li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14 pt-6 border-t border-silver/10 flex flex-col sm:flex-row justify-between gap-3">
        <p className="text-silver/70 text-xs">
          © {year} Sky Livery LLC. CPNC licensed — City of New Orleans, Sec. 162-841. $1M insured.
        </p>
        <p className="text-silver/60 text-xs">Arrive like you own the city.</p>
      </div>
    </footer>
  );
}
