export default function Footer() {
  return (
    <footer className="bg-dark pt-10 pb-6 px-4 sm:px-6 lg:px-8 border-t border-silver/[0.06]">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-white font-bold tracking-[0.15em] mb-1">SKY LIVERY <span className="text-silver text-[9px] tracking-[0.2em] font-normal">LLC</span></div>
            <div className="text-silver/60 text-xs leading-7">
              Kenner, Louisiana<br />
              (504) 000-0000<br />
              info@skylivery.llc
            </div>
          </div>
          <div>
            <p className="text-silver text-[10px] tracking-[0.15em] uppercase font-semibold mb-3">Services</p>
            <div className="text-silver/50 text-xs leading-7">
              <a href="/airport-transfer-msy" className="block hover:text-silver transition-colors">Airport transfers</a>
              <a href="/corporate-transportation-new-orleans" className="block hover:text-silver transition-colors">Corporate travel</a>
              <a href="/wedding-limo-new-orleans" className="block hover:text-silver transition-colors">Weddings and events</a>
              <a href="#book" className="block hover:text-silver transition-colors">Hourly charter</a>
              <a href="#book" className="block hover:text-silver transition-colors">Night out</a>
            </div>
          </div>
          <div>
            <p className="text-silver text-[10px] tracking-[0.15em] uppercase font-semibold mb-3">Coverage</p>
            <div className="text-silver/50 text-xs leading-7">
              <a href="/airport-transfer-msy" className="block hover:text-silver transition-colors">MSY Airport</a>
              <a href="/french-quarter-car-service" className="block hover:text-silver transition-colors">French Quarter and CBD</a>
              <a href="/metairie-car-service" className="block hover:text-silver transition-colors">Metairie and Kenner</a>
              <a href="/garden-district-car-service" className="block hover:text-silver transition-colors">Garden District and Uptown</a>
              <a href="#areas" className="block hover:text-silver transition-colors">Northshore</a>
            </div>
          </div>
        </div>
        <div className="border-t border-silver/[0.06] pt-5 flex flex-wrap justify-between gap-2">
          <p className="text-silver/30 text-[10px]">2026 Sky Livery LLC. Licensed by the City of New Orleans Ground Transportation Bureau.</p>
          <p className="text-silver/30 text-[10px]">CPNC Licensed | $1M Insured</p>
        </div>
      </div>
    </footer>
  );
}
