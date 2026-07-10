"use client";
import { useEffect, useRef, useState } from "react";

// Foreground GPS reporting while this page is open. No native app, no
// background tracking — the browser's Geolocation API only fires while
// the tab/PWA is actually on screen, which is the free, zero-app-store
// tradeoff for live location. Throttled to one post about every 20s so
// a chatty watchPosition doesn't spam the API on every tiny GPS jitter.

export default function LocationReporter({
  driverId,
  token,
}: {
  driverId: string;
  token: string;
}) {
  const [status, setStatus] = useState<"idle" | "on" | "denied" | "unsupported">("idle");
  const lastSentRef = useRef(0);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("unsupported");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setStatus("on");
        const now = Date.now();
        if (now - lastSentRef.current < 20000) return;
        lastSentRef.current = now;
        fetch("/api/driver/location", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            driverId,
            token,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        }).catch(() => {});
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, maximumAge: 15000, timeout: 20000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driverId, token]);

  if (status === "unsupported" || status === "idle") return null;

  return (
    <div className="text-center text-[10px] tracking-[0.15em] uppercase mt-2">
      {status === "on" ? (
        <span className="text-gold/60">● Location sharing on</span>
      ) : (
        <span className="text-red-400/70">Location off — allow it in your browser to share live position</span>
      )}
    </div>
  );
}
