"use client";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-dark/97 backdrop-blur-xl border-b border-silver/10" : "bg-transparent"
    }`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Sky Livery LLC" width={40} height={40} className="h-10 w-auto" />
          <div className="flex items-baseline gap-2">
            <span className="text-white font-bold text-lg tracking-[0.15em]">SKY LIVERY</span>
            <span className="text-silver text-[10px] tracking-[0.2em]">LLC</span>
          </div>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#services" className="text-silver text-sm font-medium hover:text-white transition-colors">Services</a>
          <a href="#vehicle" className="text-silver text-sm font-medium hover:text-white transition-colors">Vehicle</a>
          <a href="#areas" className="text-silver text-sm font-medium hover:text-white transition-colors">Areas</a>
          <a href="tel:5040000000" className="text-white text-sm font-semibold">(504) 000-0000</a>
          <a href="#book" className="bg-white text-navy px-5 py-2 rounded-md text-sm font-bold hover:scale-[1.02] transition-transform">Book now</a>
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white text-2xl" aria-label="Menu">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark/98 backdrop-blur-xl border-t border-silver/10 px-6 py-4 flex flex-col gap-4">
          <a href="#services" onClick={() => setMenuOpen(false)} className="text-silver text-base">Services</a>
          <a href="#vehicle" onClick={() => setMenuOpen(false)} className="text-silver text-base">Vehicle</a>
          <a href="#areas" onClick={() => setMenuOpen(false)} className="text-silver text-base">Areas</a>
          <a href="tel:5040000000" className="text-white text-base font-semibold">(504) 000-0000</a>
          <a href="#book" onClick={() => setMenuOpen(false)} className="bg-white text-navy text-center py-3 rounded-md font-bold">Book now</a>
        </div>
      )}
    </nav>
  );
}
