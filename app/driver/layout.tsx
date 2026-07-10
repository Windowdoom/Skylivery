import type { Metadata, Viewport } from "next";

// Scoped to /driver/* only, so the customer-facing site is untouched —
// this is what makes "Add to Home Screen" on a driver's personal link
// launch full-screen with its own name/icon instead of Safari/Chrome
// chrome, without a native app or app store. Deliberately no `manifest`
// field here: every driver's link is personal (?d=...&t=...), and a
// registered web manifest with a fixed start_url would make Android's
// "Install" flow launch that fixed URL instead of the driver's own —
// these meta tags alone let "Add to Home Screen" bookmark exactly the
// page that was open, which is what keeps each driver's link working.
export const metadata: Metadata = {
  title: { default: "Sky Livery Driver", template: "%s" },
  appleWebApp: {
    capable: true,
    title: "Sky Livery Driver",
    statusBarStyle: "black-translucent",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  icons: { apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0A1628",
};

export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return children;
}
