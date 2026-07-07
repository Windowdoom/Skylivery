export default function UnderlineSwash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 24"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 14 C 60 6, 120 6, 180 10 S 300 20, 316 12"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M10 20 C 80 14, 200 16, 300 18"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}
