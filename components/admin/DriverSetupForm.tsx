"use client";
import { useState } from "react";

type DriverOpt = { id: string; name: string };

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export default function DriverSetupForm({ drivers }: { drivers: DriverOpt[] }) {
  const [driverId, setDriverId] = useState("");
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyUrl, setHistoryUrl] = useState<string | null>(null);
  const [homeUrl, setHomeUrl] = useState<string | null>(null);
  const [earningsUrl, setEarningsUrl] = useState<string | null>(null);

  async function enable() {
    if (!driverId || pin.length !== 4 || busy) return;
    setBusy(true);
    setError(null);
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setError("This browser doesn't support notifications. Try Chrome or Safari on your phone.");
        return;
      }
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setError("Notifications were blocked. Enable them in your browser settings and try again.");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      await navigator.serviceWorker.ready;

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) {
        setError("Notifications aren't set up yet. Ask dispatch to finish setup.");
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      });

      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId, pin, subscription: sub.toJSON() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not finish setup.");
      } else {
        setHistoryUrl(data.historyUrl || null);
        setHomeUrl(data.homeUrl || null);
        setEarningsUrl(data.earningsUrl || null);
      }
    } catch {
      setError("Something went wrong. Try again, or ask dispatch for help.");
    } finally {
      setBusy(false);
    }
  }

  if (historyUrl) {
    return (
      <div className="text-center">
        <div className="bg-gold/10 border border-gold rounded-xl p-4">
          <div className="text-gold font-semibold">Trip alerts are on.</div>
          <p className="text-cream/70 text-xs mt-1">
            You&apos;ll get a notification for every new trip, even when this page isn&apos;t open.
          </p>
        </div>
        {homeUrl && (
          <a
            href={homeUrl}
            className="block mt-4 py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream"
          >
            My current trip
          </a>
        )}
        <p className="text-cream/50 text-[10px] mt-2">
          Bookmark that link (or add it to your home screen), it always shows what&apos;s assigned to you right
          now, even if a notification doesn&apos;t show up.
        </p>
        {earningsUrl && (
          <a
            href={earningsUrl}
            className="block mt-3 py-2.5 border border-gold/40 text-cream/80 rounded-lg text-sm hover:border-gold hover:text-gold"
          >
            View my earnings
          </a>
        )}
        <a
          href={historyUrl}
          className="block mt-3 py-2.5 border border-gold/40 text-cream/80 rounded-lg text-sm hover:border-gold hover:text-gold"
        >
          View my trip history
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <select
        value={driverId}
        onChange={(e) => setDriverId(e.target.value)}
        className="w-full bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 text-sm text-cream focus:border-gold focus:outline-none"
      >
        <option value="">I am…</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id} className="bg-navy">
            {d.name}
          </option>
        ))}
      </select>
      <input
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
        type="tel"
        inputMode="numeric"
        maxLength={4}
        placeholder="Last 4 digits of your phone number"
        className="w-full bg-navy/60 border border-gold/25 rounded-md px-3 py-2.5 text-sm text-cream text-center tracking-[0.3em] placeholder:tracking-normal focus:border-gold focus:outline-none"
      />
      {error && <p className="text-red-400 text-xs">{error}</p>}
      <button
        onClick={enable}
        disabled={!driverId || pin.length !== 4 || busy}
        className="w-full py-3 bg-gold text-navy rounded-lg font-bold tracking-wide hover:bg-cream transition-colors disabled:opacity-50"
      >
        {busy ? "Setting up…" : "Enable trip alerts"}
      </button>
      <p className="text-cream/50 text-[10px] text-center">
        On iPhone, add this page to your Home Screen first for alerts to work.
      </p>
    </div>
  );
}
