"use client";
import { useState } from "react";

export default function LoginForm() {
  const [code, setCode] = useState("");
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
        body: JSON.stringify({ code: code.trim() }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setError(j.error || "Code not recognized.");
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
        <span className="text-[10px] tracking-[0.25em] uppercase text-gold">
          Dispatcher code
        </span>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoFocus
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          className="mt-2 w-full px-4 py-3 bg-navy/60 border border-gold/25 rounded-lg text-cream text-center tracking-[0.6em] text-2xl focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/40"
        />
      </label>
      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
      <button
        type="submit"
        disabled={busy || !code}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-all disabled:opacity-50"
      >
        {busy ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-cream/40 text-[10px] uppercase tracking-[0.25em]">
        Owner or dispatcher access
      </p>
    </form>
  );
}
