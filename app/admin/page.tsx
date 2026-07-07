import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import AdminDashboard, {
  Booking,
  Driver,
  MonthlyRow,
  DriverVolumeRow,
} from "@/components/admin/AdminDashboard";

export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!isAuthed()) redirect("/admin/login");

  const sb = supabaseAdmin();

  const [bookingsRes, driversRes, monthlyRes, volumeRes] = await Promise.all([
    sb
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    sb.from("drivers").select("*").eq("active", true).order("name"),
    sb.from("monthly_revenue").select("*").limit(12),
    sb.from("driver_volume").select("*"),
  ]);

  return (
    <AdminDashboard
      bookings={(bookingsRes.data ?? []) as Booking[]}
      drivers={(driversRes.data ?? []) as Driver[]}
      monthly={(monthlyRes.data ?? []) as MonthlyRow[]}
      volume={(volumeRes.data ?? []) as DriverVolumeRow[]}
    />
  );
}
