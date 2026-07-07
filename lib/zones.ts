// INTERNAL pricing logic — never expose zone names to the customer.

export const KENNER_CENTER = { lat: 29.9941, lng: -90.2417 };
export const MSY_AIRPORT = { lat: 29.9934, lng: -90.2580 };

export const AIRPORT_FLAT_RATE = 105;
export const HOURLY_RATE = 85;
export const HOURLY_MIN_WEEKDAY = 3;
export const HOURLY_MIN_WEEKEND = 4;

// Haversine distance in miles
export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 3958.8;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Zone bands, keyed off distance from Kenner center to the farther endpoint.
function zoneRate(distanceFromCenter: number): number {
  if (distanceFromCenter <= 5) return 35;
  if (distanceFromCenter <= 12) return 55;
  if (distanceFromCenter <= 18) return 85;
  if (distanceFromCenter <= 25) return 110;
  if (distanceFromCenter <= 40) return 145;
  return 195;
}

// Is a coordinate near MSY (roughly within 1.5 mi)?
export function isNearMSY(p: { lat: number; lng: number }): boolean {
  return distanceMiles(p, MSY_AIRPORT) <= 1.5;
}

export function calculateRate(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): { rate: number; isAirport: boolean } {
  const pickup = { lat: pickupLat, lng: pickupLng };
  const dropoff = { lat: dropoffLat, lng: dropoffLng };

  const airport = isNearMSY(pickup) || isNearMSY(dropoff);
  if (airport) {
    return { rate: AIRPORT_FLAT_RATE, isAirport: true };
  }

  const dPickup = distanceMiles(KENNER_CENTER, pickup);
  const dDropoff = distanceMiles(KENNER_CENTER, dropoff);
  const farther = Math.max(dPickup, dDropoff);

  return { rate: zoneRate(farther), isAirport: false };
}
