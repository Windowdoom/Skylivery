"use client";
import { useEffect, useState } from "react";
import { FleurIcon } from "./Fleur";

const PHONE = "(504) 479-0454";
const PHONE_HREF = "tel:+15044790454";

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
        scrolled ? "bg-navy/92 backdrop-blur-xl border-b border-gold/20" : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="Sky Livery LLC" className="h-10 w-10 object-contain" />
          <div className="leading-none">
            <div className="text-cream font-display text-lg sm:text-xl tracking-[0.14em]">
              Sky Livery
            </div>
            <div className="text-gold text-[9px] tracking-[0.35em] mt-0.5 flex items-center gap-1">
              <FleurIcon className="w-2 h-2.5" />
              NOUVELLE-ORLÉANS
            </div>
          </div>
        </a>

        <div className="hidden md:flex items-center gap-7">
          <a href="/#services" className="text-cream/80 text-sm hover:text-gold transition-colors">
            Services
          </a>
          <a href="/#vehicle" className="text-cream/80 text-sm hover:text-gold transition-colors">
            Vehicle
          </a>
          <a href="/#areas" className="text-cream/80 text-sm hover:text-gold transition-colors">
            Areas
          </a>
          <a href={PHONE_HREF} className="text-gold text-sm font-semibold tracking-wide">
            {PHONE}
          </a>
          <a
            href="/book"
            className="bg-gold text-navy px-5 py-2 rounded-md text-sm font-bold tracking-wide hover:bg-cream hover:shadow-brass transition-all"
          >
            Book a ride
          </a>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-cream text-2xl leading-none"
          aria-label="Menu"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy/98 backdrop-blur-xl border-t border-gold/20 px-6 py-5 flex flex-col gap-4">
          <a onClick={() => setMenuOpen(false)} href="/#services" className="text-cream/80 text-base">
            Services
          </a>
          <a onClick={() => setMenuOpen(false)} href="/#vehicle" className="text-cream/80 text-base">
            Vehicle
          </a>
          <a onClick={() => setMenuOpen(false)} href="/#areas" className="text-cream/80 text-base">
            Areas
          </a>
          <a href={PHONE_HREF} className="text-gold text-base font-semibold">
            {PHONE}
          </a>
          <a
            onClick={() => setMenuOpen(false)}
            href="/book"
            className="bg-gold text-navy text-center py-3 rounded-md font-bold tracking-wide"
          >
            Book a ride
          </a>
        </div>
      )}
    </nav>
  );
}
