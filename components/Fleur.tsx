export function FleurIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Simplified fleur-de-lis */}
      <path
        d="M16 2 C16 8, 12 12, 12 18 C12 22, 14 24, 16 24 C18 24, 20 22, 20 18 C20 12, 16 8, 16 2 Z"
        fill="currentColor"
      />
      <path
        d="M16 14 C10 14, 5 18, 5 24 C5 28, 8 30, 11 28 C13 27, 14 24, 14 22"
        fill="currentColor"
      />
      <path
        d="M16 14 C22 14, 27 18, 27 24 C27 28, 24 30, 21 28 C19 27, 18 24, 18 22"
        fill="currentColor"
      />
      <rect x="7" y="24" width="18" height="2.2" rx="1" fill="currentColor" />
      <path
        d="M16 26 L12 36 M16 26 L20 36 M16 26 L16 38"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Fleur({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-4 justify-center ${className}`}>
      <span className="h-px w-16 sm:w-24 bg-gradient-to-r from-transparent to-gold/60" />
      <FleurIcon className="w-5 h-6 text-gold" />
      <span className="h-px w-16 sm:w-24 bg-gradient-to-l from-transparent to-gold/60" />
    </div>
  );
}
