// Signed, per-driver trip link used by web push notifications. Unlike
// the ntfy claim link (which goes out on a shared channel anyone
// subscribed could open), a push notification only ever reaches the
// one device it was sent to, so this token doesn't need the PIN layer
// the ntfy claim flow uses — knowing the link already proves it's that
// driver's own device.

import { createHmac, timingSafeEqual } from "crypto";

const SECRET = () =>
  process.env.ADMIN_HMAC_SECRET ||
  process.env.ADMIN_PASSWORD ||
  "sky-livery-fallback-dev-secret";

export function driverTripToken(tripId: string, driverId: string): string {
  return createHmac("sha256", SECRET())
    .update(`drivertrip:${tripId}:${driverId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyDriverTripToken(
  tripId: string,
  driverId: string,
  token: string
): boolean {
  const expected = driverTripToken(tripId, driverId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function driverTripUrl(tripId: string, driverId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/driver/${encodeURIComponent(tripId)}?d=${driverId}&t=${driverTripToken(tripId, driverId)}`;
}

// Persistent (not trip-scoped) link for a driver's own trip history —
// same signed-link pattern, bookmarked once after setup.
export function driverHistoryToken(driverId: string): string {
  return createHmac("sha256", SECRET())
    .update(`driverhistory:${driverId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyDriverHistoryToken(driverId: string, token: string): boolean {
  const expected = driverHistoryToken(driverId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function driverHistoryUrl(driverId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/driver/history?d=${driverId}&t=${driverHistoryToken(driverId)}`;
}
