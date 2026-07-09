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
