/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // NOLA night palette
        navy: "#0A1628",       // deep midnight (base)
        dark: "#060D1A",       // near-black for depth
        silver: "#B8AE9C",     // warm parchment (was cold gray)
        cream: "#F2E9D2",      // Vieux Carré cream / stucco
        gold: "#C9A961",       // brass / bourbon glass rim
        goldSoft: "#8C7A46",   // muted brass for borders
        wine: "#6B1D2A",       // deep bourbon (accent only)
        moss: "#3A4B3E",       // wrought iron / oak
      },
      fontFamily: {
        display: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "nola-radial":
          "radial-gradient(ellipse at 20% 0%, rgba(201,169,97,0.10) 0%, transparent 45%), radial-gradient(ellipse at 80% 100%, rgba(107,29,42,0.14) 0%, transparent 50%), linear-gradient(180deg, #0A1628 0%, #060D1A 100%)",
        "brass-line":
          "linear-gradient(90deg, transparent 0%, #C9A961 50%, transparent 100%)",
      },
      boxShadow: {
        brass: "0 0 0 1px rgba(201,169,97,0.35), 0 20px 60px -20px rgba(201,169,97,0.25)",
      },
    },
  },
  plugins: [],
};
