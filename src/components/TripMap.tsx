"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolylineF } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface MapPlace {
  id: string;
  title: string;
  description: string;
  type: "activity" | "restaurant";
  timeOrMeal: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface TripMapProps {
  places: MapPlace[];
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060,
};

export default function TripMap({ places }: TripMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // 1. Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  // 2. Leaflet Fallback (Zero-API mode) states
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const leafletMapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leafletMapInstance = useRef<any>(null);

  // Dynamically load Leaflet assets if Google Maps Key is missing
  useEffect(() => {
    if (apiKey) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).L) {
      setLeafletLoaded(true);
      return;
    }

    // Inject Leaflet CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);

    // Inject Leaflet JS
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.async = true;
    script.onload = () => {
      setLeafletLoaded(true);
    };
    document.body.appendChild(script);
  }, [apiKey]);

  // Handle Leaflet Map Initialization and updates
  useEffect(() => {
    if (apiKey || !leafletLoaded || !leafletMapRef.current || places.length === 0) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const L = (window as any).L;
    if (!L) return;

    // Clean up previous Leaflet map instance
    if (leafletMapInstance.current) {
      leafletMapInstance.current.remove();
      leafletMapInstance.current = null;
    }

    const firstPlace = places[0];
    const mapInst = L.map(leafletMapRef.current, {
      zoomControl: true,
      scrollWheelZoom: true,
    }).setView([firstPlace.position.lat, firstPlace.position.lng], 13);

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInst);

    const coordinates: [number, number][] = [];
    const markersGroup = L.featureGroup();

    places.forEach((place) => {
      if (place.position.lat && place.position.lng) {
        coordinates.push([place.position.lat, place.position.lng]);

        const color = place.type === "restaurant" ? "#d97706" : "#0f766e";

        // Custom HTML pin icon
        const customIcon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 12px ${color}; transform: scale(1.15);"></div>`,
          className: "custom-leaflet-marker",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });

        // Add Leaflet Marker
        const marker = L.marker([place.position.lat, place.position.lng], { icon: customIcon }).bindPopup(`
          <div style="font-family: inherit; width: 190px; padding: 2px;">
            <span style="background-color: ${color}; color: #ffffff; font-size: 9px; font-weight: 800; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 6px; text-transform: uppercase;">
              ${place.type === "restaurant" ? "Dining" : "Activity"}
            </span>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; line-height: 1.2;">${place.title}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; line-height: 1.35; opacity: 0.85;">${place.description}</p>
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              place.title + " " + place.position.lat + "," + place.position.lng
            )}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; font-weight: 800; color: #0f766e; text-decoration: none;">
              Open in Google Maps &rarr;
            </a>
          </div>
        `);

        markersGroup.addLayer(marker);
      }
    });

    markersGroup.addTo(mapInst);

    // Draw route path polyline
    if (coordinates.length > 1) {
      L.polyline(coordinates, {
        color: "#0f766e",
        weight: 4,
        opacity: 0.85,
        dashArray: "6, 6",
      }).addTo(mapInst);
    }

    // Auto-fit all coordinates
    if (coordinates.length > 0) {
      mapInst.fitBounds(markersGroup.getBounds(), { padding: [40, 40] });
    }

    leafletMapInstance.current = mapInst;

    return () => {
      if (leafletMapInstance.current) {
        leafletMapInstance.current.remove();
        leafletMapInstance.current = null;
      }
    };
  }, [apiKey, leafletLoaded, places]);

  // Auto-fit Google Map bounds
  useEffect(() => {
    if (!map || places.length === 0 || !apiKey) return;

    const bounds = new google.maps.LatLngBounds();
    let hasCoords = false;

    places.forEach((place) => {
      if (place.position.lat && place.position.lng) {
        bounds.extend(place.position);
        hasCoords = true;
      }
    });

    if (hasCoords) {
      map.fitBounds(bounds);

      if (places.length === 1) {
        const listener = google.maps.event.addListener(map, "bounds_changed", () => {
          map.setZoom(14);
          google.maps.event.removeListener(listener);
        });
      }
    }
  }, [map, places, apiKey]);

  if (loadError && apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-card rounded-[32px] border border-border p-6 text-foreground-muted backdrop-blur-md">
        Error loading Google Maps. Please verify your API Key.
      </div>
    );
  }

  // --- RENDERING ROUTINE ---

  // A. Zero-API Fallback: Render OpenStreetMap using Leaflet
  if (!apiKey) {
    if (!leafletLoaded) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-card rounded-[32px] border border-border backdrop-blur-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    return (
      <div className="h-full w-full rounded-[32px] overflow-hidden shadow-glass-strong border border-border relative">
        <div key={places.map((p) => p.id).join("-")} ref={leafletMapRef} style={{ width: "100%", height: "100%" }} className="z-card" />

        {/* Floating Control Badges */}
        <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-[20px] shadow-glass border border-border px-3.5 py-2 rounded-2xl text-[10px] font-extrabold text-foreground-muted z-floating">
          🗺️ Interactive Map (OpenStreetMap)
        </div>

        <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-[20px] shadow-glass border border-border px-3.5 py-2 rounded-2xl text-[11px] font-extrabold text-foreground flex items-center gap-3 z-floating">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shadow-sm"></span> Activity
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block shadow-sm"></span> Dining
          </span>
        </div>
      </div>
    );
  }

  // B. Standard Mode: Render Google Maps
  if (!isLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-card rounded-[32px] border border-border backdrop-blur-md">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const pathCoordinates = places.map((p) => p.position);

  return (
    <div className="h-full w-full rounded-[32px] overflow-hidden shadow-glass-strong border border-border relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={3}
        center={places[0]?.position || defaultCenter}
        onLoad={(mapInstance) => setMap(mapInstance)}
        onUnmount={() => setMap(null)}
        options={{
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          styles: [
            {
              featureType: "poi.business",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        }}
      >
        {pathCoordinates.length > 1 && (
          <PolylineF
            path={pathCoordinates}
            options={{
              strokeColor: "#0f766e",
              strokeOpacity: 0.85,
              strokeWeight: 4,
              geodesic: true,
            }}
          />
        )}

        {places.map((place) => (
          <MarkerF
            key={place.id}
            position={place.position}
            title={place.title}
            onClick={() => setSelectedPlace(place)}
            icon={{
              url:
                place.type === "restaurant"
                  ? "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                  : "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        ))}

        {selectedPlace && (
          <InfoWindowF position={selectedPlace.position} onCloseClick={() => setSelectedPlace(null)}>
            <div className="p-1 max-w-[220px] text-slate-950 font-sans">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white mb-1.5 ${
                  selectedPlace.type === "restaurant" ? "bg-amber-600" : "bg-teal-700"
                }`}
              >
                {selectedPlace.type === "restaurant" ? "Food" : "Activity"} ({selectedPlace.timeOrMeal})
              </span>
              <h4 className="text-sm font-extrabold text-slate-900 leading-tight">{selectedPlace.title}</h4>
              <p className="mt-1 text-xs text-slate-600 line-clamp-3 leading-normal">{selectedPlace.description}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  selectedPlace.title + " " + selectedPlace.position.lat + "," + selectedPlace.position.lng
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2.5 inline-block text-[11px] font-extrabold text-teal-700 hover:underline"
              >
                Open in Google Maps &rarr;
              </a>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>

      {/* Floating Control Badges */}
      <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-[20px] shadow-glass border border-border px-3.5 py-2 rounded-2xl text-[11px] font-extrabold text-foreground flex items-center gap-3 z-floating">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shadow-sm"></span> Activity
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block shadow-sm"></span> Dining
        </span>
      </div>
    </div>
  );
}
