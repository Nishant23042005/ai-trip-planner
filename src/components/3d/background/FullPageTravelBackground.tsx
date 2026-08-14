"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { initDynamicSky } from "./layers/DynamicSkyLayer";
import { initAnimatedGlobe } from "./layers/AnimatedGlobeLayer";
import { initFloatingTravelIcons } from "./layers/FloatingTravelIconsLayer";
import { initRouteLines } from "./layers/RouteLinesLayer";

interface FullPageTravelBackgroundProps {
  intensity?: number; // Speed scale multiplier (default: 1.0)
  enabledLayers?: ("sky" | "globe" | "icons" | "routes")[];
}

export default function FullPageTravelBackground({
  intensity = 1.0,
  enabledLayers = ["sky", "globe", "icons", "routes"],
}: FullPageTravelBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Note: To disable this 3D background completely for debugging or performance,
  // simply uncomment the return line below:
  // return null;

  useEffect(() => {
    setIsMounted(true);

    // 1. WebGL support check
    try {
      const canvas = document.createElement("canvas");
      const support = !!(window.WebGLRenderingContext && (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
      setHasWebGL(support);
      if (!support) return;
    } catch {
      setHasWebGL(false);
      return;
    }

    // 2. Reduced motion check
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speedMultiplier = prefersReducedMotion ? 0.08 : intensity;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 3. Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 7;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // 4. Initialize layers based on enabled list
    const activeLayers: { update: (elapsedTime: number, speedMultiplier: number) => void; dispose: () => void }[] = [];

    if (enabledLayers.includes("sky")) {
      activeLayers.push(initDynamicSky(scene));
    }
    if (enabledLayers.includes("globe")) {
      activeLayers.push(initAnimatedGlobe(scene));
    }
    if (enabledLayers.includes("icons")) {
      activeLayers.push(initFloatingTravelIcons(scene, speedMultiplier));
    }
    if (enabledLayers.includes("routes")) {
      activeLayers.push(initRouteLines(scene, speedMultiplier));
    }

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Update active animation layers
      activeLayers.forEach((layer) => {
        layer.update(elapsedTime, speedMultiplier);
      });

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 5. Handle Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup all WebGL objects to prevent memory leaks
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      activeLayers.forEach((layer) => layer.dispose());
      renderer.dispose();
    };
  }, [intensity, enabledLayers]);

  if (!isMounted) return null;

  if (!hasWebGL) {
    // Return an animated CSS gradient sky background as a lightweight fallback
    return (
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-tr from-[#e0f2fe] via-[#ccfbf1] to-[#ffedd5] animate-pulse" 
        style={{ backgroundSize: "400% 400%", animationDuration: "8s" }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-screen h-screen z-0 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
