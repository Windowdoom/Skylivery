import { redirect } from "next/navigation";
import { isAuthed } from "@/lib/adminAuth";
import LoginForm from "@/components/admin/LoginForm";

export const metadata = { robots: { index: false, follow: false } };

export default function AdminLoginPage() {
  if (isAuthed()) redirect("/admin");
  return (
    <main className="min-h-screen flex items-center justify-center bg-nola-radial px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">
            Sky Livery
          </div>
          <h1 className="font-display text-3xl text-cream font-semibold">
            Dispatch
          </h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
