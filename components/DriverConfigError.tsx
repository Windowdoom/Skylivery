// Shown instead of a raw Next.js crash page when Supabase itself is
// unreachable/misconfigured (wrong env vars, rotated keys, etc). Every
// driver-facing page wraps its supabaseAdmin() call in a try/catch and
// renders this on failure — a driver seeing a clear "call dispatch"
// message beats an opaque "Application error" screen with no next step.
export default function DriverConfigError() {
  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="max-w-sm text-center">
        <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">Sky Livery dispatch</div>
        <h1 className="font-display text-2xl text-cream mb-3">Can&apos;t load right now</h1>
        <p className="text-cream/70 text-sm">
          Something&apos;s wrong on our end, not with your link. Call dispatch at (504) 339-6861.
        </p>
      </div>
    </main>
  );
}
