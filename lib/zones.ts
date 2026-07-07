// INTERNAL pricing logic. Never expose zone names or per-mile rates to
// the customer. The public API returns only a final dollar amount.

export const KENNER_CENTER = { lat: 29.9941, lng: -90.2417 };
export const MSY_AIRPORT = { lat: 29.9934, lng: -90.2580 };

export const AIRPORT_FLAT_RATE = 105;
export const HOURLY_RATE = 85;
export const HOURLY_MIN_WEEKDAY = 3;
export const HOURLY_MIN_WEEKEND = 4;

// The $105 flat MSY rate covers the core service area within this many
// miles of the Kenner center point. Beyond that we tack on a per-mile fee
// for the miles outside the core zone.
export const CORE_RADIUS_MI = 18;
export const OUT_OF_ZONE_PER_MILE = 3;

// Haversine distance in miles.
export function distanceMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number }
) {
  const R = 3958.8;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) *
      Math.cos(toRad(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Zone bands keyed off distance from Kenner center to the farther endpoint.
function zoneRate(distanceFromCenter: number): number {
  if (distanceFromCenter <= 5) return 35;
  if (distanceFromCenter <= 12) return 55;
  if (distanceFromCenter <= 18) return 85;
  if (distanceFromCenter <= 25) return 110;
  if (distanceFromCenter <= 40) return 145;
  return 195;
}

// True only when the address text unambiguously names MSY itself, not a
// hotel/park/rental lot that happens to include the word "airport". We
// match distinctive multi-word phrases that are only true of the actual
// airport, plus the airport's IATA code when it appears as a standalone
// token, plus a tight geofence around the terminal building as a backup
// for cases where Places returned only "Louis Armstrong New Orleans
// International Airport (MSY)" without a street.
const AIRPORT_PHRASES = [
  "louis armstrong",
  "louis-armstrong",
  "new orleans international airport",
  "new orleans intl airport",
  "moisant field",
  "msy airport",
  // MSY's official street address is "1 Terminal Dr, Kenner, LA 70062".
  // "terminal dr" combined with Kenner or 70062 is airport-specific.
  "terminal dr, kenner",
  "terminal drive, kenner",
  "terminal dr kenner",
];

// Terminal building coordinates. Geofence is kept modest (0.5mi) so a
// residential Kenner address never trips it — Kenner center itself is
// only ~0.98mi from the terminal, so we cannot open the fence any wider
// without false-positiving on real neighborhood trips. The phrase
// checks above are the primary signal; this geofence is only a backup
// for Places pins that geocode to the terminal building.
const MSY_TERMINAL = { lat: 29.9934, lng: -90.258 };
const AIRPORT_GEOFENCE_MI = 0.5;

export function isAirportAddress(
  address: string | null | undefined,
  coords?: { lat: number; lng: number }
): boolean {
  if (address) {
    const a = address.toLowerCase();
    if (AIRPORT_PHRASES.some((kw) => a.includes(kw))) return true;
    // Match "MSY" only as a standalone token, not as part of another word
    // like "amsy" or a street name. Word boundary check.
    if (/\bmsy\b/.test(a)) return true;
    // "Terminal Dr" combined with 70062 is airport-specific too.
    if (a.includes("terminal dr") && a.includes("70062")) return true;
    if (a.includes("terminal drive") && a.includes("70062")) return true;
  }
  if (coords && distanceMiles(coords, MSY_TERMINAL) <= AIRPORT_GEOFENCE_MI) {
    return true;
  }
  return false;
}

// Legacy geofence retained for internal reference only. Not used for pricing.
export function isNearMSY(p: { lat: number; lng: number }): boolean {
  return distanceMiles(p, MSY_TERMINAL) <= AIRPORT_GEOFENCE_MI;
}

// Surcharge in whole dollars for miles beyond the core service zone.
function outOfZoneSurcharge(distFromKenner: number): number {
  if (distFromKenner <= CORE_RADIUS_MI) return 0;
  return Math.ceil((distFromKenner - CORE_RADIUS_MI) * OUT_OF_ZONE_PER_MILE);
}

export function calculateRate(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
  pickupAddress?: string,
  dropoffAddress?: string
): { rate: number; isAirport: boolean; surcharge: number } {
  const pickup = { lat: pickupLat, lng: pickupLng };
  const dropoff = { lat: dropoffLat, lng: dropoffLng };

  // Airport detection is address-text first, with a tight terminal-only
  // geofence as backup. Loose "airport" substrings would false-positive on
  // hotels/parks/rentals near MSY.
  const pickupIsMSY = isAirportAddress(pickupAddress, pickup);
  const dropoffIsMSY = isAirportAddress(dropoffAddress, dropoff);
  const airport = pickupIsMSY || dropoffIsMSY;

  if (airport) {
    // Base $105 flat + per-mile surcharge for the non-MSY endpoint's
    // distance beyond the core zone.
    const farPoint = pickupIsMSY ? dropoff : pickup;
    const dFar = distanceMiles(KENNER_CENTER, farPoint);
    const surcharge = outOfZoneSurcharge(dFar);
    return { rate: AIRPORT_FLAT_RATE + surcharge, isAirport: true, surcharge };
  }

  // Non-airport point-to-point: use zone bands off Kenner center.
  const dPickup = distanceMiles(KENNER_CENTER, pickup);
  const dDropoff = distanceMiles(KENNER_CENTER, dropoff);
  const farther = Math.max(dPickup, dDropoff);

  return { rate: zoneRate(farther), isAirport: false, surcharge: 0 };
}
