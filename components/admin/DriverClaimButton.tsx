"use client";
import { useState } from "react";

// One-tap claim for the web-push driver flow. No PIN, no name picker —
// the link itself already proves it's this driver's own device.
export default function DriverClaimButton({
  tripId,
  driverId,
  token,
  vehicleId,
}: {
  tripId: string;
  driverId: string;
  token: string;
  vehicleId: string | null;
}) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/driver/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, driverId, token, vehicleId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Claim failed.");
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
        <div className="text-gold font-semibold">Trip is yours.</div>
        <p className="text-cream/70 text-xs mt-1">Reopen this link anytime for directions and to mark it complete.</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}
      <button
        onClick={claim}
        disabled={busy}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
      >
        {busy ? "Claiming…" : "Claim trip"}
      </button>
    </div>
  );
}
