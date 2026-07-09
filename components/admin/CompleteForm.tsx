"use client";
import { useState } from "react";

// Driver-facing trip completion. If the trip is already paid (Square
// link used before or during the ride), it's one tap. Otherwise the
// driver picks how they collected payment. Kept to the minimum number
// of taps and no typing required unless the cash amount differs from
// the quoted fare.
export default function CompleteForm({
  tripId,
  token,
  alreadyPaid,
  paidMethod,
  rate,
}: {
  tripId: string;
  token: string;
  alreadyPaid: boolean;
  paidMethod: string | null;
  rate: number | null;
}) {
  const [method, setMethod] = useState<"square" | "cash" | null>(null);
  const [cashAmount, setCashAmount] = useState(rate ? String(rate) : "");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(paymentMethod: string, amount?: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId,
          token,
          paymentMethod,
          cashAmount: amount || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not complete the trip.");
      } else {
        setDone(true);
      }
    } catch {
      setError("Network error, try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 bg-gold/10 border border-gold rounded-xl p-4 text-center">
        <div className="text-gold font-semibold">Trip closed out. Nice work.</div>
        <p className="text-cream/70 text-xs mt-1">Dispatch has been notified.</p>
      </div>
    );
  }

  if (alreadyPaid) {
    return (
      <div className="mt-4 space-y-2">
        <div className="bg-emerald-400/10 border border-emerald-400/40 rounded-md px-3 py-2 text-emerald-300 text-xs">
          Already paid via {paidMethod === "square" ? "Square" : paidMethod || "card"}. Nothing to collect.
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
        <button
          onClick={() => submit(paidMethod || "square")}
          disabled={busy}
          className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
        >
          {busy ? "Closing out…" : "Mark trip complete"}
        </button>
      </div>
    );
  }

  if (!method) {
    return (
      <div className="mt-4 space-y-2">
        <p className="text-cream/60 text-[10px] tracking-[0.2em] uppercase mb-1">
          How did the customer pay?
        </p>
        <button
          onClick={() => submit("square")}
          disabled={busy}
          className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
        >
          {busy ? "…" : "Square (card)"}
        </button>
        <button
          onClick={() => setMethod("cash")}
          className="w-full py-3 border border-gold/40 text-cream rounded-lg font-semibold hover:border-gold transition-colors"
        >
          Cash
        </button>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <p className="text-cream/60 text-[10px] tracking-[0.2em] uppercase mb-1">
        Cash collected
      </p>
      <input
        value={cashAmount}
        onChange={(e) => setCashAmount(e.target.value.replace(/[^\d.]/g, ""))}
        type="text"
        inputMode="decimal"
        className="w-full bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 text-sm text-cream text-center focus:border-gold focus:outline-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        onClick={() => submit("cash", cashAmount)}
        disabled={!cashAmount || busy}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
      >
        {busy ? "Closing out…" : `Complete & mark $${cashAmount || "0"} cash`}
      </button>
      <button
        onClick={() => setMethod(null)}
        className="w-full py-1.5 text-cream/50 text-xs hover:text-gold"
      >
        Back
      </button>
    </div>
  );
}
