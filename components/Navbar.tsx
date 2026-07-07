"use client";
import { useEffect, useState } from "react";

const PHONE = "(504) 000-0000";
const PHONE_HREF = "tel:+15040000000";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    h();
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-navy/90 backdrop-blur-xl border-b border-silver/10" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Sky Livery LLC" className="h-9 w-9 object-contain" />
          <div className="leading-none">
            <div className="text-white font-bold text-base sm:text-lg tracking-[0.18em]">SKY LIVERY</div>
            <div className="text-silver text-[9px] tracking-[0.3em] mt-0.5">LLC · NEW ORLEANS</div>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-7">
          <a href="/#services" className="text-silver text-sm hover:text-white transition-colors">Services</a>
          <a href="/#vehicle" className="text-silver text-sm hover:text-white transition-colors">Vehicle</a>
          <a href="/#areas" className="text-silver text-sm hover:text-white transition-colors">Areas</a>
          <a href={PHONE_HREF} className="text-white text-sm font-semibold">{PHONE}</a>
          <a
            href="/#book"
            className="bg-white text-navy px-5 py-2 rounded-md text-sm font-bold hover:scale-[1.03] transition-transform"
          >
            Book now
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-white text-2xl leading-none"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-xl border-t border-silver/10 px-6 py-5 flex flex-col gap-4">
          <a onClick={() => setMenuOpen(false)} href="/#services" className="text-silver text-base">Services</a>
          <a onClick={() => setMenuOpen(false)} href="/#vehicle" className="text-silver text-base">Vehicle</a>
          <a onClick={() => setMenuOpen(false)} href="/#areas" className="text-silver text-base">Areas</a>
          <a href={PHONE_HREF} className="text-white text-base font-semibold">{PHONE}</a>
          <a
            onClick={() => setMenuOpen(false)}
            href="/#book"
            className="bg-white text-navy text-center py-3 rounded-md font-bold"
          >
            Book now
          </a>
        </div>
      )}
    </nav>
  );
}
