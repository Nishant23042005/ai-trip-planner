"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BackgroundTravelLinesProps {
  speed?: number;
  opacity?: number;
}

export default function BackgroundTravelLines({
  speed = 0.04,
  opacity = 0.15,
}: BackgroundTravelLinesProps) {
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

    // 4. Create Curved flight route lines
    const lineGroup = new THREE.Group();
    const lineCount = 4;
    const lineGeometries: THREE.BufferGeometry[] = [];
    const lineMaterials: THREE.LineBasicMaterial[] = [];

    for (let i = 0; i < lineCount; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-3.5, -2 + i * 0.8, (Math.random() - 0.5) * 2), // Start coordinate
        new THREE.Vector3((Math.random() - 0.5) * 2, 2 - i * 0.5, (Math.random() - 0.5) * 3), // Curve control midpoint
        new THREE.Vector3(3.5, -1 - i * 0.4, (Math.random() - 0.5) * 2) // End coordinate
      );

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      lineGeometries.push(geometry);

      const material = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? 0x0ea5e9 : 0xea580c, // alternate brand colors
        transparent: true,
        opacity: opacity * 0.5,
        linewidth: 1, // WebGL standard width
      });
      lineMaterials.push(material);

      const line = new THREE.Line(geometry, material);
      lineGroup.add(line);
    }

    scene.add(lineGroup);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      
      // Rotate path container slightly to create a 3D parallax effect
      lineGroup.rotation.y = Math.sin(elapsedTime * speed) * 0.15;
      lineGroup.rotation.x = Math.cos(elapsedTime * speed * 0.7) * 0.1;

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
      lineGeometries.forEach((g) => g.dispose());
      lineMaterials.forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, [speed, opacity]);

  if (!hasWebGL) {
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
