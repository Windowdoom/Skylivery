"use client";
import { useEffect, useRef } from "react";

// Bounding box roughly covering the Greater New Orleans metro
// SW: Belle Chasse area, NE: north shore
const NOLA_BOUNDS = {
  south: 29.7,
  west: -90.5,
  north: 30.6,
  east: -89.6,
};

declare global {
  interface Window {
    google?: any;
    __gmapsLoaderPromise?: Promise<void>;
  }
}

function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.google?.maps?.places) return Promise.resolve();
  if (window.__gmapsLoaderPromise) return window.__gmapsLoaderPromise;

  window.__gmapsLoaderPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });

  return window.__gmapsLoaderPromise;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  icon?: React.ReactNode;
};

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  className,
  icon,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<any>(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey || !inputRef.current) return;

    let cancelled = false;

    loadGoogleMaps(apiKey)
      .then(() => {
        if (cancelled || !inputRef.current || !window.google?.maps?.places) return;

        const bounds = new window.google.maps.LatLngBounds(
          new window.google.maps.LatLng(NOLA_BOUNDS.south, NOLA_BOUNDS.west),
          new window.google.maps.LatLng(NOLA_BOUNDS.north, NOLA_BOUNDS.east)
        );

        acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
          bounds,
          strictBounds: false,
          componentRestrictions: { country: "us" },
          fields: ["formatted_address", "name", "geometry"],
          types: ["geocode", "establishment"],
        });

        acRef.current.addListener("place_changed", () => {
          const place = acRef.current.getPlace();
          const addr =
            place?.formatted_address ||
            (place?.name && place.geometry ? place.name : "") ||
            inputRef.current?.value ||
            "";
          if (addr) onChange(addr);
        });
      })
      .catch(() => {
        // Silent — plain input still works
      });

    return () => {
      cancelled = true;
      if (acRef.current && window.google?.maps?.event) {
        window.google.maps.event.clearInstanceListeners(acRef.current);
      }
    };
    // Only bind once per input; onChange is captured via ref semantics
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative">
      {icon}
      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
    </div>
  );
}
