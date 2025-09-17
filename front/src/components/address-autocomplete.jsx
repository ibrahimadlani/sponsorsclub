"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps(callback) {
  if (typeof window === "undefined") return;
  if (window.google && window.google.maps && window.google.maps.places) {
    callback();
    return;
  }
  // Avoid injecting multiple scripts
  if (document.getElementById("google-maps-script")) {
    const existing = document.getElementById("google-maps-script");
    existing.addEventListener("load", callback);
    return;
  }
  const script = document.createElement("script");
  script.id = "google-maps-script";
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY || "",
    libraries: "places",
    language: "fr",
  });
  script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  script.async = true;
  script.defer = true;
  script.onload = callback;
  document.body.appendChild(script);
}

export default function AddressAutocomplete({
  value,
  onChange,
  placeholder = "Saisissez votre adresse",
  id = "address-autocomplete",
  className = "",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    loadGoogleMaps(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready || !inputRef.current || !window.google?.maps?.places) return;
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ["address"],
      fields: ["formatted_address", "address_components", "geometry"],
      componentRestrictions: undefined,
    });
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      const formatted = place?.formatted_address || inputRef.current.value;
      onChange?.(formatted);
    });
    return () => {
      if (listener) window.google.maps.event.removeListener(listener);
    };
  }, [ready, onChange]);

  return (
    <input
      ref={inputRef}
      id={id}
      name={id}
      placeholder={placeholder}
      className={className}
      value={value || ""}
      onChange={(e) => onChange?.(e.target.value)}
      disabled={disabled}
      autoComplete="off"
    />
  );
}

