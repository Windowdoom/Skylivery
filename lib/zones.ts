// INTERNAL PRICING LOGIC - Never exposed to the customer
// Customer sees a flat rate. They never see "Zone 3" or any zone reference.

const KENNER_CENTER = { lat: 29.9841, lng: -90.2417 };

export const ZONE_RATES = [
  { maxMiles: 5, rate: 35 },
  { maxMiles: 12, rate: 55 },
  { maxMiles: 18, rate: 85 },
  { maxMiles: 25, rate: 110 },
  { maxMiles: 40, rate: 145 },
  { maxMiles: Infinity, rate: 195 },
];

export const AIRPORT_RATE = 105;
export const HOURLY_RATE = 85;
export const HOURLY_MIN_WEEKDAY = 3;
export const HOURLY_MIN_WEEKEND = 4;

// City minimums per 162-841
export const MIN_SUV = 25;
export const MIN_AIRPORT_SUV = 90;

// MSY airport coordinates
const MSY = { lat: 29.9934, lng: -90.2580 };
const LAKEFRONT = { lat: 30.0424, lng: -90.0283 };

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3959; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function isNearAirport(lat: number, lng: number): boolean {
  const distToMSY = haversineDistance(lat, lng, MSY.lat, MSY.lng);
  const distToLakefront = haversineDistance(lat, lng, LAKEFRONT.lat, LAKEFRONT.lng);
  return distToMSY < 2 || distToLakefront < 2;
}

export function calculateRate(
  pickupLat: number, pickupLng: number,
  dropoffLat: number, dropoffLng: number
): { rate: number; isAirport: boolean } {
  const pickupIsAirport = isNearAirport(pickupLat, pickupLng);
  const dropoffIsAirport = isNearAirport(dropoffLat, dropoffLng);

  if (pickupIsAirport || dropoffIsAirport) {
    return { rate: Math.max(AIRPORT_RATE, MIN_AIRPORT_SUV), isAirport: true };
  }

  // Calculate distance from Kenner center to the farther point
  const distPickup = haversineDistance(
    KENNER_CENTER.lat, KENNER_CENTER.lng, pickupLat, pickupLng
  );
  const distDropoff = haversineDistance(
    KENNER_CENTER.lat, KENNER_CENTER.lng, dropoffLat, dropoffLng
  );
  const maxDist = Math.max(distPickup, distDropoff);

  // Cross-zone surcharge: if pickup and dropoff span multiple zones
  const pickupZone = ZONE_RATES.findIndex(z => distPickup <= z.maxMiles);
  const dropoffZone = ZONE_RATES.findIndex(z => distDropoff <= z.maxMiles);
  const zonesCrossed = Math.abs(dropoffZone - pickupZone);
  const surcharge = zonesCrossed > 1 ? (zonesCrossed - 1) * 15 : 0;

  const baseRate = ZONE_RATES.find(z => maxDist <= z.maxMiles)?.rate || 195;
  const totalRate = Math.max(baseRate + surcharge, MIN_SUV);

  return { rate: totalRate, isAirport: false };
}

export function generateTripId(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `SL-${year}-${rand}`;
}
