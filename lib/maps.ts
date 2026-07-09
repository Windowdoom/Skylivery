// Tappable navigation link for driver-facing texts. Using Google Maps'
// universal "dir" URL with only a destination (no origin) means it uses
// the driver's current location as the starting point automatically —
// one tap and turn-by-turn navigation starts. Works on both iOS and
// Android whether or not the Google Maps app is installed (falls back
// to the mobile web version, which still navigates fine).
export function mapsDirectionsUrl(address: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    address
  )}&travelmode=driving`;
}

// Full-trip navigation as one link: current location (no origin set,
// so Maps uses wherever the driver is) -> pickup as a waypoint stop ->
// dropoff as the final destination. One tap gives the whole route
// instead of two separate links the driver has to switch between.
export function mapsTripUrl(pickup: string, dropoff: string): string {
  return (
    `https://www.google.com/maps/dir/?api=1` +
    `&destination=${encodeURIComponent(dropoff)}` +
    `&waypoints=${encodeURIComponent(pickup)}` +
    `&travelmode=driving`
  );
}
