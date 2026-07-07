"use client";
import { useState } from "react";

export default function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Login failed.");
      } else {
        window.location.href = "/admin";
      }
    } catch {
      setError("Network error.");
    }
    setBusy(false);
  }

  return (
    <form
      onSubmit={submit}
      className="bg-navy/70 border border-gold/30 rounded-2xl p-6 backdrop-blur-2xl shadow-brass space-y-4"
    >
      <label className="block">
        <span className="text-[10px] tracking-[0.25em] uppercase text-gold">Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          className="mt-2 w-full px-4 py-3 bg-navy/60 border border-gold/25 rounded-lg text-cream text-sm focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
      </label>
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        type="submit"
        disabled={busy || !password}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-all disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
