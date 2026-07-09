"use client";
import { useState } from "react";

type DriverOpt = { id: string; name: string; primary_vehicle: string | null };
type VehicleOpt = {
  id: string;
  cpnc_number: string;
  make: string | null;
  model: string | null;
};

// Driver picks their own name (and vehicle) and claims the trip. Posts
// to /api/claim which verifies the signed token from the link.
export default function ClaimForm({
  tripId,
  token,
  drivers,
  vehicles,
}: {
  tripId: string;
  token: string;
  drivers: DriverOpt[];
  vehicles: VehicleOpt[];
}) {
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pickDriver(id: string) {
    setDriverId(id);
    const drv = drivers.find((d) => d.id === id);
    if (drv?.primary_vehicle) setVehicleId(drv.primary_vehicle);
  }

  async function claim() {
    if (!driverId || pin.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, token, driverId, vehicleId: vehicleId || null, pin }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Claim failed.");
      } else {
        setDone(data.driverName);
      }
    } catch {
      setError("Network error — try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-4 bg-gold/10 border border-gold rounded-xl p-4 text-center">
        <div className="text-gold font-semibold">Trip is yours, {done}.</div>
        <p className="text-cream/70 text-xs mt-1">
          Dispatch and the customer have been notified. Details are in the assignment push.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-2">
      <select
        value={driverId}
        onChange={(e) => pickDriver(e.target.value)}
        className="w-full bg-navy/60 border border-gold/25 rounded-md px-2 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
      >
        <option value="">I am…</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id} className="bg-navy">
            {d.name}
          </option>
        ))}
      </select>
      <select
        value={vehicleId}
        onChange={(e) => setVehicleId(e.target.value)}
        className="w-full bg-navy/60 border border-gold/25 rounded-md px-2 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
      >
        <option value="">Vehicle…</option>
        {vehicles.map((v) => {
          const desc = [v.make, v.model].filter(Boolean).join(" ");
          return (
            <option key={v.id} value={v.id} className="bg-navy">
              {v.cpnc_number}
              {desc ? ` · ${desc}` : ""}
            </option>
          );
        })}
      </select>
      {driverId && (
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
          type="tel"
          inputMode="numeric"
          maxLength={4}
          placeholder="Last 4 digits of your phone number"
          className="w-full bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 text-sm text-cream text-center tracking-[0.3em] placeholder:tracking-normal focus:border-gold focus:outline-none"
        />
      )}
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        onClick={claim}
        disabled={!driverId || pin.length !== 4 || busy}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
      >
        {busy ? "Claiming…" : "Claim trip"}
      </button>
    </div>
  );
}
