"use client";

import React, { useRef } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

export default function TiltCard({
  children,
  className = "",
  maxTilt = 8,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Motion values for tracking mouse position relative to card dimensions
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);

  // Map mouse positions to rotation values
  const rotateX = useTransform(y, [0, 1], [maxTilt, -maxTilt]);
  const rotateY = useTransform(x, [0, 1], [-maxTilt, maxTilt]);

  // Spring animation settings for ultra-smooth inertia
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;

    // Detect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse coords relative to card
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalized progress values (0 to 1)
    const normX = mouseX / width;
    const normY = mouseY / height;

    x.set(normX);
    y.set(normY);
  };

  const handleMouseLeave = () => {
    // Return smoothly to center state
    x.set(0.5);
    y.set(0.5);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
      className="w-full h-full select-none"
    >
      <motion.div
        style={{
          rotateX: springRotateX,
          rotateY: springRotateY,
          transformStyle: "preserve-3d",
        }}
        className={`w-full h-full transition-shadow duration-300 ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
