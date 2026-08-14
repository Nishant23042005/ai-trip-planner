"use client";

import React, { useRef, useState, useEffect } from "react";

interface Floating3DCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // Maximum rotation in degrees (default 6)
  scale?: number; // Scale on hover (default 1.02)
}

export default function Floating3DCard({
  children,
  className = "",
  maxTilt = 6,
  scale = 1.02,
  ...props
}: Floating3DCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Respect system reduced motion preferences
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to card center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    setCoords({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords({ x: 0, y: 0 });
  };

  // Compute 3D rotation transform based on mouse coords
  const rotateX = reducedMotion ? 0 : -coords.y * maxTilt;
  const rotateY = reducedMotion ? 0 : coords.x * maxTilt;
  const activeScale = isHovered ? scale : 1;

  const style: React.CSSProperties = {
    transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${activeScale}, ${activeScale}, 1)`,
    transition: isHovered ? "transform 0.1s cubic-bezier(0.25, 1, 0.5, 1)" : "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)",
    transformStyle: "preserve-3d",
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`will-change-transform ${className}`}
      {...props}
    >
      {/* Re-inject 3D perspective wrapper to allow inner elements to pop */}
      <div style={{ transform: "translateZ(20px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </div>
  );
}
