"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Compass, Sparkles } from "lucide-react";
import * as THREE from "three";
import ErrorBoundary from "../ErrorBoundary";

function BouncingTravelGem() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (mesh) {
      // Rotate around axes
      mesh.rotation.x = state.clock.getElapsedTime() * 0.8;
      mesh.rotation.y = state.clock.getElapsedTime() * 0.5;

      // Bouncing movement
      mesh.position.y = Math.sin(state.clock.getElapsedTime() * 2.5) * 0.25;
    }
  });

  return (
    <mesh ref={meshRef}>
      {/* Travel Dodecahedron shape representing a morphic waypoint */}
      <dodecahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color="#0ea5e9"
        roughness={0.1}
        metalness={0.8}
        wireframe={false}
      />
    </mesh>
  );
}

function LoadingCanvas() {
  const fallback = <Compass className="h-16 w-16 animate-spin-slow text-primary" />;

  return (
    <ErrorBoundary fallback={fallback}>
      <Canvas
        camera={{ position: [0, 0, 3.5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        className="w-40 h-40"
      >
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={2.0} />
        <BouncingTravelGem />
      </Canvas>
    </ErrorBoundary>
  );
}

interface LoadingScene3DProps {
  loadingText?: string;
}

export default function LoadingScene3D({ loadingText = "Curating Adventure..." }: LoadingScene3DProps) {
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const support = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setHasWebGL(support);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-[32px] border border-border bg-card shadow-glass relative overflow-hidden min-h-[420px] animate-scale-in">
      {/* 3D Canvas / Fallback Icon */}
      <div className="relative mb-6 flex h-36 w-36 items-center justify-center rounded-3xl bg-primary/10 border border-primary/20 text-primary">
        {hasWebGL ? (
          <LoadingCanvas />
        ) : (
          <Compass className="h-16 w-16 animate-spin-slow text-primary" />
        )}
        <Sparkles className="absolute right-2 top-2 h-7 w-7 text-accent animate-bounce" />
      </div>

      <h2 className="font-heading text-2xl font-extrabold text-foreground">Generating Your Journey...</h2>
      
      <p className="mt-4 text-primary font-extrabold tracking-wider text-sm animate-pulse">
        {loadingText}
      </p>

      {/* Progress timeline bar */}
      <div className="mt-8 w-72 bg-muted border border-border rounded-full h-2 overflow-hidden relative shadow-inner">
        <div className="bg-primary h-2 rounded-full absolute left-0 top-0 animate-loading-bar" style={{ width: "70%" }}></div>
      </div>
    </div>
  );
}
