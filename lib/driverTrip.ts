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

// Persistent "my current trip" home page — meant to be bookmarked/
// added to the home screen once, so a driver can always check what's
// assigned to them even if a push notification never showed (Android
// battery optimization and blocked notification permissions can
// silently swallow a push with no error on our end).
export function driverHomeToken(driverId: string): string {
  return createHmac("sha256", SECRET())
    .update(`driverhome:${driverId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyDriverHomeToken(driverId: string, token: string): boolean {
  const expected = driverHomeToken(driverId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function driverHomeUrl(driverId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/driver/home?d=${driverId}&t=${driverHomeToken(driverId)}`;
}

// Persistent "my earnings" link — today/this-week totals and payout,
// same bookmark-once pattern as home/history.
export function driverEarningsToken(driverId: string): string {
  return createHmac("sha256", SECRET())
    .update(`driverearnings:${driverId}`)
    .digest("hex")
    .slice(0, 20);
}

export function verifyDriverEarningsToken(driverId: string, token: string): boolean {
  const expected = driverEarningsToken(driverId);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function driverEarningsUrl(driverId: string): string {
  const base = process.env.PUBLIC_SITE_URL || "https://www.skyliverynola.com";
  return `${base}/driver/earnings?d=${driverId}&t=${driverEarningsToken(driverId)}`;
}
