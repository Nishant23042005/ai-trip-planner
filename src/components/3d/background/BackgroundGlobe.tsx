"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BackgroundGlobeProps {
  speed?: number;
  opacity?: number;
}

export default function BackgroundGlobe({
  speed = 0.05,
  opacity = 0.12,
}: BackgroundGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Note: To disable this 3D background completely for debugging or performance,
  // simply uncomment the line below:
  // return null;

  useEffect(() => {
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
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || 500;

    // 3. Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create Globe Mesh (wireframe low-poly)
    const geometry = new THREE.IcosahedronGeometry(2.2, 1);
    const material = new THREE.MeshBasicMaterial({
      color: 0x0ea5e9, // Vibrant sky blue
      wireframe: true,
      transparent: true,
      opacity,
    });
    const globe = new THREE.Mesh(geometry, material);
    scene.add(globe);

    // Soft Ambient lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate the globe slowly
      globe.rotation.y = elapsedTime * speed;
      globe.rotation.x = elapsedTime * speed * 0.3;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 5. Handle Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [speed, opacity]);

  if (!hasWebGL) {
    // Return a soft static gradient if WebGL fails
    return (
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20 bg-gradient-to-tr from-primary/10 via-transparent to-accent/10" 
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden"
    >
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}
