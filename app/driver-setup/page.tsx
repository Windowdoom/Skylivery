import { supabaseAdmin } from "@/lib/supabaseAdmin";
import DriverSetupForm from "@/components/admin/DriverSetupForm";
import DriverConfigError from "@/components/DriverConfigError";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Driver setup | Sky Livery dispatch",
  robots: { index: false, follow: false },
};

// One-time page a driver visits to enable trip notifications on their
// phone. Verified the same way the ntfy claim page is (last 4 digits
// of the phone on file), since this link can be shared/bookmarked by
// anyone, not a private per-driver push link.

export default async function DriverSetupPage() {
  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return <DriverConfigError />;
  }
  const { data: drivers } = await sb
    .from("drivers")
    .select("id, name")
    .eq("active", true)
    .order("name");

  return (
    <main className="min-h-screen bg-navy flex items-center justify-center p-5">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold">Sky Livery dispatch</div>
          <h1 className="font-display text-2xl text-cream mt-1">Turn on trip alerts</h1>
          <p className="text-cream/60 text-sm mt-2">
            One-time setup, works even when this page isn&apos;t open.
          </p>
        </div>
        <div className="bg-navy/70 border border-gold/40 rounded-2xl p-5">
          <DriverSetupForm drivers={(drivers ?? []) as { id: string; name: string }[]} />
        </div>
      </div>
    </main>
  );
}
