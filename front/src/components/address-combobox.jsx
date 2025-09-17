"use client";

import { useEffect, useRef, useState } from "react";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

function loadGooglePlaces(cb) {
  if (typeof window === "undefined") return;
  if (window.google?.maps?.places) {
    cb();
    return;
  }
  const existing = document.getElementById("google-maps-script");
  if (existing) {
    existing.addEventListener("load", cb, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = "google-maps-script";
  const params = new URLSearchParams({ key: GOOGLE_API_KEY || "", libraries: "places", language: "fr" });
  script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
  script.async = true;
  script.defer = true;
  script.onload = cb;
  document.body.appendChild(script);
}

export default function AddressCombobox({
  value,
  onChange,
  id = "address",
  placeholder = "Saisissez votre adresse",
  className = "",
  disabled = false,
}) {
  const inputRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const timer = useRef(null);
  const serviceRef = useRef(null);

  useEffect(() => {
    loadGooglePlaces(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    serviceRef.current = new window.google.maps.places.AutocompleteService();
  }, [ready]);

  const fetchPredictions = (q) => {
    if (!serviceRef.current || !q) {
      setPredictions([]);
      return;
    }
    serviceRef.current.getPlacePredictions(
      { input: q, types: ["address"], componentRestrictions: undefined },
      (res) => setPredictions(res || [])
    );
  };

  const handleChange = (e) => {
    const v = e.target.value;
    onChange?.(v);
    setOpen(!!v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => fetchPredictions(v), 200);
  };

  const handleSelect = (p) => {
    onChange?.(p.description);
    setOpen(false);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        id={id}
        name={id}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        value={value || ""}
        onChange={handleChange}
        onFocus={() => value && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md overflow-hidden">
          <ul className="max-h-64 overflow-auto py-1">
            {predictions.map((p) => (
              <li key={p.place_id}>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(p)}
                >
                  {p.description}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

