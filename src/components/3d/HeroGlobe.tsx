"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { Sparkles } from "lucide-react";
import InteractiveGlobe from "../InteractiveGlobe"; // Zero-lag fallback
import ErrorBoundary from "../ErrorBoundary";

interface Marker {
  name: string;
  country: string;
  position: [number, number, number];
  color: string;
}

const MARKERS: Marker[] = [
  { name: "Kyoto", country: "Japan", position: [1.2, 0.8, 1.2], color: "#0f766e" },
  { name: "London", country: "United Kingdom", position: [-0.3, 1.4, 0.9], color: "#0284c7" },
  { name: "New York", country: "United States", position: [-1.1, 1.0, 1.0], color: "#d97706" },
  { name: "Paris", country: "France", position: [-0.1, 1.3, 1.1], color: "#b91c1c" },
  { name: "Rio de Janeiro", country: "Brazil", position: [-0.8, -0.9, 1.3], color: "#047857" },
  { name: "Sydney", country: "Australia", position: [1.2, -1.0, -1.1], color: "#0369a1" },
];

function GlobePoints() {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate spherical point cloud coordinates
  const pointsGeometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const count = 3000;
    const positions = new Float32Array(count * 3);
    const radius = 1.8;

    for (let i = 0; i < count; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;

      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    if (points) {
      // Auto-rotation
      points.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <points ref={pointsRef}>
      <primitive object={pointsGeometry} attach="geometry" />
      <pointsMaterial
        color="#0EA5E9"
        size={0.035}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.65}
      />
    </points>
  );
}

function GlobeSphere() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (mesh) {
      mesh.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.78, 32, 32]} />
      <meshBasicMaterial
        color="#F0F9FF"
        transparent={true}
        opacity={0.3}
        wireframe={true}
      />
    </mesh>
  );
}

interface GlobeSceneProps {
  onSelectMarker: (name: string) => void;
}

function GlobeScene({ onSelectMarker }: GlobeSceneProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (group) {
      // Gently rotate active markers with globe rotation
      group.rotation.y = state.clock.getElapsedTime() * 0.08;
    }
  });

  return (
    <>
      <ambientLight intensity={1.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      
      {/* Central Dotted Spherical Globe */}
      <GlobePoints />
      <GlobeSphere />

      {/* Destination Pin Markers */}
      <group ref={groupRef}>
        {MARKERS.map((marker, index) => (
          <mesh
            key={index}
            position={marker.position}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHovered(marker.name);
            }}
            onPointerOut={() => setHovered(null)}
            onClick={(e) => {
              e.stopPropagation();
              onSelectMarker(`${marker.name}, ${marker.country}`);
            }}
          >
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshBasicMaterial color={marker.color} />

            {/* Glowing ring under marker */}
            <mesh scale={[1.4, 1.4, 1.4]}>
              <ringGeometry args={[0.08, 0.12, 16]} />
              <meshBasicMaterial color={marker.color} transparent={true} opacity={0.55} side={THREE.DoubleSide} />
            </mesh>

            {/* Three.js HTML Tooltip */}
            {hovered === marker.name && (
              <Html distanceFactor={6} center>
                <div className="bg-card/95 border border-border backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-glass text-center animate-scale-in pointer-events-none select-none min-w-[120px]">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-primary block">
                    ✦ Plan Now ✦
                  </span>
                  <h4 className="text-xs font-extrabold text-foreground">{marker.name}</h4>
                  <span className="text-[10px] text-foreground-muted">{marker.country}</span>
                </div>
              </Html>
            )}
          </mesh>
        ))}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={false}
        dampingFactor={0.05}
      />
    </>
  );
}

interface HeroGlobeProps {
  onSelectDestination?: (dest: string) => void;
}

export default function HeroGlobe({ onSelectDestination }: HeroGlobeProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const support = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setHasWebGL(support);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!isMounted) return null;

  // Fallback to custom 2D projected canvas globe if WebGL is unsupported
  if (!hasWebGL) {
    return <InteractiveGlobe onSelectDestination={onSelectDestination} />;
  }

  const fallback = <InteractiveGlobe onSelectDestination={onSelectDestination} />;

  return (
    <div className="w-[300px] h-[300px] sm:w-[320px] sm:h-[320px] md:w-[360px] md:h-[360px] relative select-none cursor-grab active:cursor-grabbing">
      <ErrorBoundary fallback={fallback}>
        <Canvas
          camera={{ position: [0, 0, 4.5], fov: 50 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
        >
          <GlobeScene onSelectMarker={onSelectDestination || (() => {})} />
        </Canvas>
      </ErrorBoundary>

      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-foreground-muted uppercase tracking-widest bg-card border border-border px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-primary animate-pulse" /> Drag to Rotate Globe
      </div>
    </div>
  );
}
