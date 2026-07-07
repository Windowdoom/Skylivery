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

// True only when the address is unambiguously MSY airport, judged by the
// text the customer entered. We do NOT use a geofence because MSY sits
// inside Kenner, so a radius around MSY coordinates would incorrectly
// flag ordinary Kenner addresses (residential, Metairie-bound, etc.) as
// airport trips. Requiring an airport keyword in the address is the only
// reliable signal.
const AIRPORT_KEYWORDS = [
  "msy",
  "airport",
  "louis armstrong",
  "louis-armstrong",
  "new orleans international",
  "moisant",
  "terminal",
  "kenner ave", // MSY's main access road
];

export function isAirportAddress(address: string | null | undefined): boolean {
  if (!address) return false;
  const a = address.toLowerCase();
  return AIRPORT_KEYWORDS.some((kw) => a.includes(kw));
}

// Legacy geofence retained for internal reference only. Not used for pricing.
export function isNearMSY(p: { lat: number; lng: number }): boolean {
  return distanceMiles(p, MSY_AIRPORT) <= 0.4;
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

  // Airport detection is purely address-text based. MSY is inside Kenner,
  // so a lat/lng radius would false-positive on ordinary Kenner trips.
  const pickupIsMSY = isAirportAddress(pickupAddress);
  const dropoffIsMSY = isAirportAddress(dropoffAddress);
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
