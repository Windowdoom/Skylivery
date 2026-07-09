"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Keeps a server-rendered page live while it's sitting open — without
// this, a driver who leaves their trip page open won't see a payment
// land or a trip get reassigned until they manually reload. Since the
// page is already force-dynamic/no-store, a router.refresh() re-runs
// the server fetch and gets truly fresh data, not a cached copy.
export default function AutoRefresh({ seconds = 25 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => router.refresh(), seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
