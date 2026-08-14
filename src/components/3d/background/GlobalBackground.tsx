"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface GlobalBackgroundProps {
  intensity?: number; // Speed and motion scale (default: 1.0)
  variant?: "default" | "minimal";
}

export default function GlobalBackground({
  intensity = 1.0,
  variant = "default",
}: GlobalBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  // Note: To disable this global 3D background completely for debugging or performance,
  // simply uncomment the return line below:
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

    // 2. Accessibility Check (Reduced motion)
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speedMultiplier = prefersReducedMotion ? 0.1 : intensity;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    // 3. Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // 4. Create Floating Low-Poly Geometric Shapes (Cubes, Spheres, Pyramids)
    const geometries = [
      new THREE.BoxGeometry(0.6, 0.6, 0.6), // Cube
      new THREE.IcosahedronGeometry(0.4, 0), // Sphere/Icosahedron
      new THREE.ConeGeometry(0.4, 0.8, 4), // Pyramid
    ];

    const materials = [
      new THREE.MeshPhongMaterial({ color: 0x0ea5e9, flatShading: true, transparent: true, opacity: 0.28 }), // Sky Blue
      new THREE.MeshPhongMaterial({ color: 0x0f766e, flatShading: true, transparent: true, opacity: 0.25 }), // Dark Teal
      new THREE.MeshPhongMaterial({ color: 0xea580c, flatShading: true, transparent: true, opacity: 0.22 }), // Coral orange
    ];

    const shapes: {
      mesh: THREE.Mesh;
      speedX: number;
      speedY: number;
      rotSpeedX: number;
      rotSpeedY: number;
    }[] = [];

    const shapeCount = variant === "minimal" ? 6 : 12;

    for (let i = 0; i < shapeCount; i++) {
      const geo = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geo, mat);

      // Distribute randomly across full viewport coordinates
      mesh.position.x = (Math.random() - 0.5) * 12;
      mesh.position.y = (Math.random() - 0.5) * 8;
      mesh.position.z = (Math.random() - 0.5) * 4;

      scene.add(mesh);

      shapes.push({
        mesh,
        // Noticeable speeds (crossing screen in 3-6 seconds under default intensity)
        speedX: (Math.random() * 0.02 + 0.015) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
        speedY: (Math.random() * 0.02 + 0.015) * (Math.random() > 0.5 ? 1 : -1) * speedMultiplier,
        rotSpeedX: (Math.random() * 0.02 + 0.01) * speedMultiplier,
        rotSpeedY: (Math.random() * 0.02 + 0.01) * speedMultiplier,
      });
    }

    // 5. Create Animated flight/route lines
    const lineGroup = new THREE.Group();
    const lineCount = 3;
    const routeLines: { line: THREE.Line; speed: number }[] = [];

    for (let i = 0; i < lineCount; i++) {
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-6, -3 + i * 1.5, 0),
        new THREE.Vector3((Math.random() - 0.5) * 4, 3 - i * 0.8, -2),
        new THREE.Vector3(6, -2 - i * 0.5, 0)
      );

      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: 0x0ea5e9,
        transparent: true,
        opacity: 0.18,
      });

      const line = new THREE.Line(geometry, material);
      lineGroup.add(line);
      routeLines.push({ line, speed: (0.005 + i * 0.002) * speedMultiplier });
    }
    scene.add(lineGroup);

    // 6. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    let animationFrameId: number;

    const animate = () => {
      // Rotate and translate floating geometric shapes
      shapes.forEach((shape) => {
        shape.mesh.position.x += shape.speedX;
        shape.mesh.position.y += shape.speedY;
        
        shape.mesh.rotation.x += shape.rotSpeedX;
        shape.mesh.rotation.y += shape.rotSpeedY;

        // Wrap around boundaries
        if (shape.mesh.position.x > 7) {
          shape.mesh.position.x = -7;
        } else if (shape.mesh.position.x < -7) {
          shape.mesh.position.x = 7;
        }

        if (shape.mesh.position.y > 5) {
          shape.mesh.position.y = -5;
        } else if (shape.mesh.position.y < -5) {
          shape.mesh.position.y = 5;
        }
      });

      // Slowly wave travel lines in parallax
      lineGroup.rotation.y = Math.sin(Date.now() * 0.0004 * speedMultiplier) * 0.15;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // 7. Handle Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      lineGroup.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => mat.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      renderer.dispose();
    };
  }, [intensity, variant]);

  if (!hasWebGL) {
    // Return an animated CSS gradient fallback
    return (
      <div 
        className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-tr from-primary/10 via-background to-accent/15 animate-pulse" 
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
