"use client";

import { useEffect, useRef, useState } from "react";
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF, PolylineF } from "@react-google-maps/api";
import { Compass, Loader2, Maximize2, Minimize2 } from "lucide-react";

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

interface TripMap3DProps {
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

export default function TripMap3D({ places }: TripMap3DProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [is3D, setIs3D] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);

  // 1. Google Maps loader
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey ?? "",
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

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
    }).setView([firstPlace.position.lat, firstPlace.position.lng], 14);

    // Load OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(mapInst);

    const coordinates: [number, number][] = [];
    const markersGroup = L.featureGroup();

    places.forEach((place) => {
      if (place.position.lat && place.position.lng) {
        coordinates.push([place.position.lat, place.position.lng]);

        const color = place.type === "restaurant" ? "#EA580C" : "#0EA5E9";

        // Custom HTML pin icon
        const customIcon = L.divIcon({
          html: `<div style="background-color: ${color}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); transform: scale(1.1); transition: transform 0.2s;" class="hover:scale-125"></div>`,
          className: "custom-leaflet-marker",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
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
            )}" target="_blank" rel="noopener noreferrer" style="font-size: 10px; font-weight: 800; color: #0EA5E9; text-decoration: none;">
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
      const polyline = L.polyline(coordinates, {
        color: "var(--primary)",
        weight: 3.5,
        opacity: 0.75,
        dashArray: "8, 8",
      }).addTo(mapInst);

      mapInst.fitBounds(polyline.getBounds(), { padding: [40, 40] });
    } else if (coordinates.length === 1) {
      mapInst.setView(coordinates[0], 14);
    }

    leafletMapInstance.current = mapInst;
  }, [apiKey, leafletLoaded, places]);

  // Handle center updates in Google Map
  useEffect(() => {
    if (map && places.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {
        if (place.position.lat && place.position.lng) {
          bounds.extend(place.position);
        }
      });
      map.fitBounds(bounds);
      
      // If only one place, center zoom on it
      if (places.length === 1 && places[0].position.lat) {
        map.setCenter(places[0].position);
        map.setZoom(15);
      }
    }
  }, [map, places]);

  // Render Google Map options
  const center = places.length > 0 && places[0].position.lat ? places[0].position : defaultCenter;
  
  // Custom styled Google Map configuration
  const mapOptions = {
    tilt: is3D ? 45 : 0,
    heading: is3D ? 40 : 0,
    mapTypeId: is3D ? "hybrid" : "roadmap", // Hybrid loads photorealistic satellite & 3D tiles
    gestureHandling: "cooperative",
    disableDefaultUI: false,
    zoomControl: true,
  };

  return (
    <div className="w-full h-full relative group/map overflow-hidden rounded-[32px] border border-border bg-card shadow-glass-strong">
      
      {/* 3D View Toggle Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-floating">
        <button
          onClick={() => setIs3D(!is3D)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-md border border-border transition-all duration-200 bg-white/90 text-foreground-secondary hover:text-primary hover:bg-white"
        >
          {is3D ? (
            <>
              <Minimize2 className="h-3.5 w-3.5" />
              <span>Standard 2D</span>
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Perspective 3D</span>
            </>
          )}
        </button>
      </div>

      {/* Main Map Render viewport */}
      <div 
        className="w-full h-full transition-transform duration-500 origin-center"
        style={
          !apiKey && is3D
            ? {
                transform: "perspective(1200px) rotateX(28deg) rotateY(-2deg) rotateZ(-3deg) scale(1.05)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
              }
            : {}
        }
      >
        {apiKey ? (
          // Google Map mode
          isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={14}
              options={mapOptions}
              onLoad={(m) => setMap(m)}
            >
              {places.map((place) => {
                if (!place.position.lat) return null;
                return (
                  <MarkerF
                    key={place.id}
                    position={place.position}
                    onClick={() => setSelectedPlace(place)}
                  />
                );
              })}

              {selectedPlace && (
                <InfoWindowF
                  position={selectedPlace.position}
                  onCloseClick={() => setSelectedPlace(null)}
                >
                  <div className="p-1 max-w-[220px] text-slate-950 font-sans">
                    <span
                      className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold text-white mb-1.5 ${
                        selectedPlace.type === "restaurant" ? "bg-accent" : "bg-primary"
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
                      className="inline-block mt-3 text-[10px] font-extrabold text-primary hover:underline"
                    >
                      Open in Google Maps &rarr;
                    </a>
                  </div>
                </InfoWindowF>
              )}

              {places.length > 1 && (
                <PolylineF
                  path={places.map((p) => p.position)}
                  options={{
                    strokeColor: "#0EA5E9",
                    strokeOpacity: 0.75,
                    strokeWeight: 4,
                  }}
                />
              )}
            </GoogleMap>
          ) : loadError ? (
            <div className="flex h-full w-full items-center justify-center p-6 text-foreground-muted backdrop-blur-md">
              <Compass className="h-6 w-6 text-rose-500 mr-2" /> Load Error
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-card">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )
        ) : (
          // Leaflet fallback mode (if API key missing)
          <div ref={leafletMapRef} className="w-full h-full relative z-base" />
        )}
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md shadow-glass border border-border px-3.5 py-2 rounded-2xl text-[11px] font-extrabold text-foreground flex items-center gap-3 z-floating pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-primary inline-block shadow-sm"></span> Activity
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-accent inline-block shadow-sm"></span> Dining
        </div>
      </div>
    </div>
  );
}
