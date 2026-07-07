// Hand-drawn silhouette of New Orleans motifs across the bottom of the hero.
// Pure SVG, no images. Left to right: streetcar, oak with Spanish moss,
// wrought-iron balcony, St. Louis Cathedral, palm, Mississippi River curve.
export default function NolaSkyline({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1600 260"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYEnd meet"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fadeGold" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#C9A961" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C9A961" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="cream" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F2E9D2" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F2E9D2" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Distant river curve */}
      <path
        d="M0 220 Q 400 200 800 218 T 1600 210 L 1600 260 L 0 260 Z"
        fill="url(#fadeGold)"
        opacity="0.25"
      />

      {/* Streetcar (left) */}
      <g stroke="url(#fadeGold)" strokeWidth="1.5" fill="none">
        <rect x="60" y="170" width="150" height="46" rx="4" />
        <line x1="60" y1="184" x2="210" y2="184" />
        <rect x="70" y="187" width="20" height="22" />
        <rect x="98" y="187" width="20" height="22" />
        <rect x="126" y="187" width="20" height="22" />
        <rect x="154" y="187" width="20" height="22" />
        <rect x="182" y="187" width="20" height="22" />
        {/* Trolley pole */}
        <line x1="135" y1="170" x2="135" y2="140" />
        <line x1="120" y1="140" x2="150" y2="140" />
        {/* Wheels */}
        <circle cx="85" cy="221" r="6" />
        <circle cx="185" cy="221" r="6" />
      </g>

      {/* Live oak with Spanish moss */}
      <g fill="url(#cream)" opacity="0.55">
        <path d="M 260 220 C 240 190, 260 160, 280 155 C 260 145, 310 120, 335 140 C 360 118, 400 130, 400 155 C 425 155, 445 175, 435 200 C 445 210, 435 225, 415 225 L 260 225 Z" />
        {/* Trunk */}
        <rect x="330" y="220" width="10" height="30" fill="url(#fadeGold)" />
      </g>
      <g stroke="url(#fadeGold)" strokeWidth="1" opacity="0.5">
        <line x1="290" y1="175" x2="290" y2="200" />
        <line x1="310" y1="180" x2="310" y2="205" />
        <line x1="340" y1="170" x2="340" y2="200" />
        <line x1="370" y1="180" x2="370" y2="210" />
        <line x1="400" y1="175" x2="400" y2="200" />
      </g>

      {/* French Quarter balcony ironwork */}
      <g stroke="url(#fadeGold)" strokeWidth="1.2" fill="none" opacity="0.85">
        <rect x="500" y="160" width="200" height="60" />
        <line x1="500" y1="180" x2="700" y2="180" />
        {/* Balcony rail scrollwork */}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
          const x = 505 + i * 20;
          return (
            <g key={i}>
              <path d={`M ${x} 180 Q ${x + 5} 170 ${x + 10} 180`} />
              <path d={`M ${x} 220 L ${x} 180`} />
            </g>
          );
        })}
        <line x1="500" y1="222" x2="700" y2="222" />
        {/* French doors */}
        <rect x="520" y="185" width="14" height="35" />
        <rect x="560" y="185" width="14" height="35" />
        <rect x="620" y="185" width="14" height="35" />
        <rect x="660" y="185" width="14" height="35" />
      </g>

      {/* St. Louis Cathedral (three spires) */}
      <g stroke="url(#cream)" strokeWidth="1.5" fill="none">
        {/* Central spire (tallest) */}
        <path d="M 830 80 L 820 130 L 840 130 Z" />
        <rect x="815" y="130" width="30" height="90" />
        {/* Left spire */}
        <path d="M 785 105 L 778 140 L 792 140 Z" />
        <rect x="775" y="140" width="20" height="80" />
        {/* Right spire */}
        <path d="M 875 105 L 868 140 L 882 140 Z" />
        <rect x="865" y="140" width="20" height="80" />
        {/* Rose window */}
        <circle cx="830" cy="165" r="8" />
        {/* Base */}
        <rect x="765" y="200" width="130" height="20" />
      </g>

      {/* Wrought iron gate pattern */}
      <g stroke="url(#fadeGold)" strokeWidth="1" opacity="0.55">
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 950 + i * 22;
          return (
            <g key={i}>
              <line x1={x} y1="170" x2={x} y2="222" />
              <circle cx={x} cy="180" r="4" fill="none" />
              <path d={`M ${x - 5} 195 Q ${x} 205 ${x + 5} 195`} fill="none" />
            </g>
          );
        })}
        <line x1="945" y1="170" x2="1085" y2="170" />
        <line x1="945" y1="222" x2="1085" y2="222" />
      </g>

      {/* Palm tree */}
      <g fill="url(#fadeGold)" opacity="0.7">
        <path d="M 1180 220 L 1178 130 L 1183 130 L 1181 220 Z" />
        <path d="M 1180 130 Q 1140 100 1120 120 Q 1150 108 1180 132 Z" />
        <path d="M 1180 130 Q 1220 100 1240 120 Q 1210 108 1180 132 Z" />
        <path d="M 1180 128 Q 1150 90 1170 78 Q 1176 100 1183 128 Z" />
        <path d="M 1180 128 Q 1210 90 1190 78 Q 1184 100 1178 128 Z" />
      </g>

      {/* Superdome (right) */}
      <g stroke="url(#cream)" strokeWidth="1.2" fill="none" opacity="0.7">
        <path d="M 1320 210 Q 1320 150 1400 150 Q 1480 150 1480 210" />
        <line x1="1320" y1="210" x2="1480" y2="210" />
        <line x1="1340" y1="185" x2="1460" y2="185" />
      </g>

      {/* Skyline high-rises far right */}
      <g stroke="url(#fadeGold)" strokeWidth="1" fill="none" opacity="0.5">
        <rect x="1510" y="150" width="20" height="70" />
        <rect x="1535" y="130" width="18" height="90" />
        <rect x="1558" y="165" width="22" height="55" />
        {/* Windows dots */}
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <circle cx="1520" cy={165 + r * 12} r="0.8" fill="currentColor" />
            <circle cx="1544" cy={145 + r * 12} r="0.8" fill="currentColor" />
          </g>
        ))}
      </g>
    </svg>
  );
}
