import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminDashboard, {
  Booking,
  Driver,
  Vehicle,
  MonthlyRow,
  DriverVolumeRow,
} from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!isAuthed()) redirect("/admin/login");

  let sb;
  try {
    sb = supabaseAdmin();
  } catch (e) {
    return (
      <ErrorScreen
        title="Supabase admin not configured"
        detail={e instanceof Error ? e.message : String(e)}
        hint="Set SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in Vercel and redeploy."
      />
    );
  }

  const [bookingsRes, driversRes, vehiclesRes, monthlyRes, volumeRes] =
    await Promise.all([
      sb.from("bookings").select("*").order("created_at", { ascending: false }).limit(200),
      sb.from("drivers").select("*").eq("active", true).order("name"),
      sb.from("vehicles").select("*").eq("active", true).order("cpnc_number"),
      sb.from("monthly_revenue").select("*").limit(12),
      sb.from("driver_volume").select("*"),
    ]);

  const errors = [
    bookingsRes.error && `bookings: ${bookingsRes.error.message}`,
    driversRes.error && `drivers: ${driversRes.error.message}`,
    vehiclesRes.error && `vehicles: ${vehiclesRes.error.message}`,
    monthlyRes.error && `monthly_revenue: ${monthlyRes.error.message}`,
    volumeRes.error && `driver_volume: ${volumeRes.error.message}`,
  ].filter(Boolean) as string[];

  return (
    <>
      {errors.length > 0 && (
        <div className="bg-red-900/40 border-b border-red-500/40 text-red-200 text-xs p-3 text-center font-mono">
          {errors.join("  ·  ")}
        </div>
      )}
      <AdminDashboard
        bookings={(bookingsRes.data ?? []) as Booking[]}
        drivers={(driversRes.data ?? []) as Driver[]}
        vehicles={(vehiclesRes.data ?? []) as Vehicle[]}
        monthly={(monthlyRes.data ?? []) as MonthlyRow[]}
        volume={(volumeRes.data ?? []) as DriverVolumeRow[]}
      />
    </>
  );
}

function ErrorScreen({
  title,
  detail,
  hint,
}: {
  title: string;
  detail: string;
  hint: string;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-navy p-6">
      <div className="max-w-lg text-cream">
        <div className="text-[10px] tracking-[0.3em] uppercase text-red-400 mb-2">
          Dispatch offline
        </div>
        <h1 className="font-display text-2xl mb-3">{title}</h1>
        <p className="text-cream/80 text-sm mb-2 font-mono">{detail}</p>
        <p className="text-gold/80 text-xs">{hint}</p>
      </div>
    </main>
  );
}
