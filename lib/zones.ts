// INTERNAL pricing logic. Never expose zone names, per-mile rates, or
// out-of-state surcharges to the customer. The public API returns a
// final dollar amount and, for very long trips, a "call for quote"
// signal so the front-end can redirect them to phone.

export const KENNER_CENTER = { lat: 29.9941, lng: -90.2417 };
export const MSY_AIRPORT = { lat: 29.9934, lng: -90.258 };

export const AIRPORT_FLAT_RATE = 105;
export const HOURLY_RATE = 85;
export const HOURLY_MIN_WEEKDAY = 3;
export const HOURLY_MIN_WEEKEND = 4;

// The $105 flat MSY rate covers the core service area within this many
// miles of the Kenner center point. Beyond that we tack on a per-mile
// fee based on real driving distance for the non-airport leg.
export const CORE_RADIUS_MI = 18;
export const PER_MILE = 3;

// Non-airport point-to-point long-haul kicks in past 40 miles road.
// From that point, pure per-mile from mile 1 (no base fee).
export const LONG_HAUL_THRESHOLD_MI = 40;

// Route to phone if the driving distance exceeds this OR the drop-off is
// past Mississippi. Deposit + planning territory.
export const PHONE_QUOTE_MI = 250;

// Return leg fees for one-way long trips, bracketed by driving duration
// in minutes.
export const RETURN_FEE_TIERS: { minMinutes: number; fee: number }[] = [
  { minMinutes: 5 * 60, fee: -1 }, // 5+ hours = phone
  { minMinutes: 4 * 60, fee: 100 },
  { minMinutes: 3 * 60, fee: 75 },
];

export function returnFee(oneWayMinutes: number): number {
  for (const tier of RETURN_FEE_TIERS) {
    if (oneWayMinutes >= tier.minMinutes) return tier.fee;
  }
  return 0;
}

// Haversine straight-line distance in miles. Used only for zone lookup
// off Kenner center. Actual per-mile calculations use real driving
// distance from the Distance Matrix API.
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
  return 145; // caps here; anything past 40 crow-flies is long-haul
}

const AIRPORT_PHRASES = [
  "louis armstrong",
  "louis-armstrong",
  "new orleans international airport",
  "new orleans intl airport",
  "moisant field",
  "msy airport",
  "terminal dr, kenner",
  "terminal drive, kenner",
  "terminal dr kenner",
];

const MSY_TERMINAL = { lat: 29.9934, lng: -90.258 };
const AIRPORT_GEOFENCE_MI = 0.5;

export function isAirportAddress(
  address: string | null | undefined,
  coords?: { lat: number; lng: number }
): boolean {
  if (address) {
    const a = address.toLowerCase();
    if (AIRPORT_PHRASES.some((kw) => a.includes(kw))) return true;
    if (/\bmsy\b/.test(a)) return true;
    if (a.includes("terminal dr") && a.includes("70062")) return true;
    if (a.includes("terminal drive") && a.includes("70062")) return true;
  }
  if (coords && distanceMiles(coords, MSY_TERMINAL) <= AIRPORT_GEOFENCE_MI) {
    return true;
  }
  return false;
}

export function isNearMSY(p: { lat: number; lng: number }): boolean {
  return distanceMiles(p, MSY_TERMINAL) <= AIRPORT_GEOFENCE_MI;
}

// Detect which state the address is in. Returns two-letter code or null.
// Cheap heuristic on the address string; Google's formatted address
// always includes the state name or code.
export function detectState(
  address: string | null | undefined
): string | null {
  if (!address) return null;
  const a = address.toLowerCase();
  // Louisiana (home state)
  if (/\bla\b/.test(a) || a.includes("louisiana")) return "LA";
  if (/\bms\b/.test(a) || a.includes("mississippi")) return "MS";
  if (/\bal\b/.test(a) || a.includes("alabama")) return "AL";
  if (/\btx\b/.test(a) || a.includes("texas")) return "TX";
  if (/\bfl\b/.test(a) || a.includes("florida")) return "FL";
  if (/\bga\b/.test(a) || a.includes("georgia")) return "GA";
  if (/\btn\b/.test(a) || a.includes("tennessee")) return "TN";
  if (/\bar\b/.test(a) || a.includes("arkansas")) return "AR";
  return null;
}

// Out-of-state surcharge in dollars. Mississippi is a short-hop
// neighbor so it takes a lower surcharge; other states are a full trip.
export function outOfStateSurcharge(state: string | null): number {
  if (!state || state === "LA") return 0;
  if (state === "MS") return 50;
  return 100;
}

// True if the trip should not be quoted online. Anything past 250 road
// miles one-way is deposit territory, and anything past Mississippi
// (interior MS beyond a certain point, or crossing into AL/TX/FL/GA/TN)
// also gets routed to phone for planning.
export function shouldRouteToPhone(
  drivingMiles: number,
  drivingMinutes: number,
  state: string | null
): { route: boolean; reason?: string } {
  if (drivingMiles > PHONE_QUOTE_MI) {
    return { route: true, reason: "long-distance" };
  }
  if (drivingMinutes >= 5 * 60) {
    return { route: true, reason: "long-duration" };
  }
  // Beyond Mississippi (further southeast states)
  if (state && ["AL", "TX", "FL", "GA", "TN", "AR"].includes(state)) {
    if (drivingMiles > 150) {
      return { route: true, reason: "past-mississippi" };
    }
  }
  return { route: false };
}

export type RateResult =
  | {
      kind: "quote";
      rate: number;
      isAirport: boolean;
      breakdown: {
        base: number;
        perMileMiles: number;
        perMileTotal: number;
        oosSurcharge: number;
        returnFee: number;
        state: string | null;
      };
    }
  | {
      kind: "phone";
      reason: string;
    };

export function calculateRate(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number,
  drivingMiles: number,
  drivingMinutes: number,
  pickupAddress?: string,
  dropoffAddress?: string
): RateResult {
  const pickup = { lat: pickupLat, lng: pickupLng };
  const dropoff = { lat: dropoffLat, lng: dropoffLng };

  const pickupIsMSY = isAirportAddress(pickupAddress, pickup);
  const dropoffIsMSY = isAirportAddress(dropoffAddress, dropoff);
  const airport = pickupIsMSY || dropoffIsMSY;

  // The state we care about for OOS is whichever endpoint is NOT Louisiana.
  const pickupState = detectState(pickupAddress);
  const dropoffState = detectState(dropoffAddress);
  const nonLaState =
    pickupState && pickupState !== "LA"
      ? pickupState
      : dropoffState && dropoffState !== "LA"
        ? dropoffState
        : null;

  const phone = shouldRouteToPhone(drivingMiles, drivingMinutes, nonLaState);
  if (phone.route) {
    return { kind: "phone", reason: phone.reason ?? "long" };
  }

  const oos = outOfStateSurcharge(nonLaState);
  const rf = returnFee(drivingMinutes);
  if (rf < 0) {
    return { kind: "phone", reason: "long-duration" };
  }

  if (airport) {
    // MSY: $105 base + $3/mi beyond 18mi (using real driving miles)
    const farPoint = pickupIsMSY ? dropoff : pickup;
    const dFarCrow = distanceMiles(KENNER_CENTER, farPoint);
    // Prefer real driving miles when the non-airport point is farther
    // than the core radius crow-flies. This keeps short trips flat and
    // long trips accurately priced.
    const perMileMiles = Math.max(0, drivingMiles - CORE_RADIUS_MI);
    const perMileTotal = Math.ceil(perMileMiles * PER_MILE);
    const total = AIRPORT_FLAT_RATE + perMileTotal + oos + rf;
    return {
      kind: "quote",
      rate: total,
      isAirport: true,
      breakdown: {
        base: AIRPORT_FLAT_RATE,
        perMileMiles: Math.round(perMileMiles * 10) / 10,
        perMileTotal,
        oosSurcharge: oos,
        returnFee: rf,
        state: nonLaState,
      },
    };
    void dFarCrow;
  }

  // Non-airport: zone bands under 40mi (crow-flies from Kenner center to
  // farther endpoint), pure $3/mi past 40mi road distance.
  const dPickup = distanceMiles(KENNER_CENTER, pickup);
  const dDropoff = distanceMiles(KENNER_CENTER, dropoff);
  const farther = Math.max(dPickup, dDropoff);

  const zoneFare = zoneRate(farther);
  const longHaulFare = Math.ceil(drivingMiles * PER_MILE);

  // Whichever produces a higher fare wins. Prevents the "Hammond at
  // 45mi road but only ~38mi crow-flies" edge case from being cheaper
  // than a Slidell trip.
  const base = drivingMiles > LONG_HAUL_THRESHOLD_MI
    ? Math.max(zoneFare, longHaulFare)
    : zoneFare;

  const total = base + oos + rf;
  return {
    kind: "quote",
    rate: total,
    isAirport: false,
    breakdown: {
      base,
      perMileMiles: drivingMiles > LONG_HAUL_THRESHOLD_MI ? drivingMiles : 0,
      perMileTotal: drivingMiles > LONG_HAUL_THRESHOLD_MI ? longHaulFare : 0,
      oosSurcharge: oos,
      returnFee: rf,
      state: nonLaState,
    },
  };
}
