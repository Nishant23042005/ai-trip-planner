"use client";

import React, { useRef, useEffect, useState } from "react";

interface GlobePoint {
  x: number;
  y: number;
  z: number;
  lat: number;
  lng: number;
}

interface DestinationMarker {
  name: string;
  country: string;
  lat: number;
  lng: number;
  color: string;
}

const DESTINATIONS: DestinationMarker[] = [
  { name: "Kyoto", country: "Japan", lat: 35.0116, lng: 135.7681, color: "#0f766e" },
  { name: "London", country: "United Kingdom", lat: 51.5074, lng: -0.1278, color: "#0284c7" },
  { name: "New York", country: "United States", lat: 40.7128, lng: -74.0060, color: "#d97706" },
  { name: "Paris", country: "France", lat: 48.8566, lng: 2.3522, color: "#b91c1c" },
  { name: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729, color: "#047857" },
  { name: "Sydney", country: "Australia", lat: -33.8688, lng: 151.2093, color: "#0369a1" },
];

export default function InteractiveGlobe({ onSelectDestination }: { onSelectDestination?: (dest: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredMarker, setHoveredMarker] = useState<DestinationMarker | null>(null);

  // Globe dimensions and properties
  const radius = 135;
  const dotDensity = 24; // Number of longitudinal rows
  const [points, setPoints] = useState<GlobePoint[]>([]);

  // Initialize points on the sphere surface (dotted wireframe look)
  useEffect(() => {
    const pts: GlobePoint[] = [];
    for (let i = 0; i < dotDensity; i++) {
      const lat = (Math.PI * i) / dotDensity - Math.PI / 2;
      const count = Math.round(Math.cos(lat) * dotDensity * 2);
      for (let j = 0; j < count; j++) {
        const lng = (2 * Math.PI * j) / count - Math.PI;
        
        // Convert spherical coords to 3D Cartesian coords
        const x = radius * Math.cos(lat) * Math.cos(lng);
        const y = radius * Math.sin(lat);
        const z = radius * Math.cos(lat) * Math.sin(lng);
        
        pts.push({ x, y, z, lat: (lat * 180) / Math.PI, lng: (lng * 180) / Math.PI });
      }
    }
    setPoints(pts);
  }, []);

  // Mouse Drag to rotate globe
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;
      setRotation((prev) => ({
        x: prev.x - deltaY * 0.005,
        y: prev.y + deltaX * 0.005,
      }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resolvedThemeColor = () => {
    return "rgba(15, 118, 110, 0.15)";
  };

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || points.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let autoRotationY = rotation.y;
    let autoRotationX = rotation.x;

    const render = () => {
      // Auto-rotate if not dragging
      if (!isDragging) {
        autoRotationY += 0.0015;
      } else {
        autoRotationY = rotation.y;
        autoRotationX = rotation.x;
      }

      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Project and render dots
      ctx.fillStyle = resolvedThemeColor();

      const projectedPoints = points.map((p) => {
        // Rotate around Y axis
        const x1 = p.x * Math.cos(autoRotationY) - p.z * Math.sin(autoRotationY);
        const z1 = p.x * Math.sin(autoRotationY) + p.z * Math.cos(autoRotationY);
        
        // Rotate around X axis
        const y2 = p.y * Math.cos(autoRotationX) - z1 * Math.sin(autoRotationX);
        const z2 = p.y * Math.sin(autoRotationX) + z1 * Math.cos(autoRotationX);

        // Perspective projection factor
        const perspective = 300 / (300 - z2);
        
        return {
          x: cx + x1 * perspective,
          y: cy + y2 * perspective,
          z: z2,
          perspective,
        };
      });

      // Sort points back-to-front so back dots don't cover front dots
      projectedPoints.sort((a, b) => a.z - b.z);

      // Draw background dots (behind the sphere center)
      projectedPoints.forEach((pt) => {
        if (pt.z < 0) {
          const dotSize = Math.max(0.5, (1.2 + pt.z / radius) * pt.perspective);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotSize, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(15, 118, 110, 0.08)";
          ctx.fill();
        }
      });

      // Draw active destination markers
      const projectedMarkers = DESTINATIONS.map((marker) => {
        // Convert lat/lng to spherical coordinates
        const latRad = (marker.lat * Math.PI) / 180;
        const lngRad = (marker.lng * Math.PI) / 180;

        const mx = radius * Math.cos(latRad) * Math.cos(lngRad);
        const my = radius * Math.sin(latRad);
        const mz = radius * Math.cos(latRad) * Math.sin(lngRad);

        // Rotate Y
        const x1 = mx * Math.cos(autoRotationY) - mz * Math.sin(autoRotationY);
        const z1 = mx * Math.sin(autoRotationY) + mz * Math.cos(autoRotationY);
        
        // Rotate X
        const y2 = my * Math.cos(autoRotationX) - z1 * Math.sin(autoRotationX);
        const z2 = my * Math.sin(autoRotationX) + z1 * Math.cos(autoRotationX);

        const perspective = 300 / (300 - z2);

        return {
          marker,
          x: cx + x1 * perspective,
          y: cy + y2 * perspective,
          z: z2,
          perspective,
        };
      });

      // Draw front sphere dots
      projectedPoints.forEach((pt) => {
        if (pt.z >= 0) {
          const dotSize = Math.max(0.8, (1.6 + pt.z / radius) * pt.perspective);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, dotSize, 0, 2 * Math.PI);
          ctx.fillStyle = "rgba(15, 118, 110, 0.25)";
          ctx.fill();
        }
      });

      // Draw front markers with glowing highlight circles
      projectedMarkers.forEach((pm) => {
        if (pm.z >= 0) {
          const size = 6 * pm.perspective;

          // Outer pulsing glow
          ctx.beginPath();
          ctx.arc(pm.x, pm.y, size * 2.2, 0, 2 * Math.PI);
          ctx.fillStyle = hexToRgba(pm.marker.color, 0.25);
          ctx.fill();

          // Center solid core
          ctx.beginPath();
          ctx.arc(pm.x, pm.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = pm.marker.color;
          ctx.strokeStyle = "#ffffff";
          ctx.lineWidth = 1.5;
          ctx.fill();
          ctx.stroke();

          // Text Label
          ctx.font = "bold 10px var(--font-plus-jakarta), sans-serif";
          ctx.fillStyle = "#0f172a";
          ctx.shadowColor = "rgba(255,255,255,0.8)";
          ctx.shadowBlur = 4;
          ctx.fillText(pm.marker.name, pm.x + 10, pm.y + 3);
          ctx.shadowBlur = 0; // reset
        }
      });

      // Check mouse collision over markers (front ones only)
      canvas.onmousemove = (evt) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = evt.clientX - rect.left;
        const mouseY = evt.clientY - rect.top;
        
        let found: DestinationMarker | null = null;
        projectedMarkers.forEach((pm) => {
          if (pm.z >= 0) {
            const dist = Math.hypot(pm.x - mouseX, pm.y - mouseY);
            if (dist < 14) {
              found = pm.marker;
            }
          }
        });
        setHoveredMarker(found);
      };

      // Handle clicking destinations
      canvas.onclick = () => {
        if (hoveredMarker && onSelectDestination) {
          onSelectDestination(`${hoveredMarker.name}, ${hoveredMarker.country}`);
        }
      };

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, rotation, isDragging, hoveredMarker]);

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className="relative flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing w-[300px] h-[300px] sm:w-[320px] sm:h-[320px]"
    >
      <canvas
        ref={canvasRef}
        width={320}
        height={320}
        className="w-full h-full"
      />

      {/* Floating Marker Tooltip Overlay */}
      {hoveredMarker && (
        <div className="absolute top-2 bg-card/95 border border-border backdrop-blur-md px-4 py-2 rounded-2xl shadow-glass text-center animate-scale-in z-floating pointer-events-none">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            Explore Destination
          </span>
          <h4 className="text-sm font-extrabold text-foreground">{hoveredMarker.name}</h4>
          <span className="text-[11px] text-foreground-secondary">{hoveredMarker.country}</span>
        </div>
      )}
    </div>
  );
}
