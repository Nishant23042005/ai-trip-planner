"use client";

import { useRef } from "react";
import { useJsApiLoader, Autocomplete } from "@react-google-maps/api";

interface DestinationInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

const libraries: "places"[] = ["places"];

export default function DestinationInput({ value, onChange, placeholder }: DestinationInputProps) {
  // Gracefully handle missing Google Maps Key
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
    libraries: apiKey ? libraries : undefined,
  });

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onLoad = (autocompleteInstance: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocompleteInstance;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace();
      const address = place.formatted_address || place.name || "";
      onChange(address);
    }
  };

  if (loadError) {
    console.error("Google Maps Places API load error:", loadError);
  }

  // If the API isn't loaded, fails, or no API key is specified, fall back to a normal text input
  if (!apiKey || !isLoaded || loadError) {
    return (
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Enter destination (e.g. Paris, France)"}
        className="w-full rounded-2xl border border-border bg-input text-foreground px-4 py-3.5 text-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-ring backdrop-blur-md shadow-sm placeholder:text-foreground-muted"
      />
    );
  }

  return (
    <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search destinations (e.g. Paris, France)"}
        className="w-full rounded-2xl border border-border bg-input text-foreground px-4 py-3.5 text-sm outline-none transition duration-200 focus:border-primary focus:ring-2 focus:ring-ring backdrop-blur-md shadow-sm placeholder:text-foreground-muted"
      />
    </Autocomplete>
  );
}
