"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface BackgroundParticlesProps {
  count?: number;
  speed?: number;
  opacity?: number;
}

export default function BackgroundParticles({
  count = 120,
  speed = 0.08,
  opacity = 0.22,
}: BackgroundParticlesProps) {
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
    camera.position.z = 6;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create floating particle point cloud
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const initialY = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Wide grid spreading
      const x = (Math.random() - 0.5) * 12;
      const y = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 5;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      initialY[i] = y;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x0ea5e9, // Sky Blue
      size: 0.04,
      transparent: true,
      opacity,
      sizeAttenuation: true,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();
      const posAttribute = geometry.getAttribute("position") as THREE.BufferAttribute;

      for (let i = 0; i < count; i++) {
        // Slowly float upward
        let yVal = posAttribute.getY(i);
        yVal += speed * 0.01;

        // Wrap around when drifting off-screen
        if (yVal > 4) {
          yVal = -4;
        }

        posAttribute.setY(i, yVal);
        
        // Add subtle horizontal sine drift
        const xVal = posAttribute.getX(i);
        posAttribute.setX(i, xVal + Math.sin(elapsedTime + i) * 0.001);
      }

      posAttribute.needsUpdate = true;
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
  }, [count, speed, opacity]);

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
