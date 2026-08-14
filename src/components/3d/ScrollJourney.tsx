"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Compass, Globe, MapPin, Plane, Utensils } from "lucide-react";

export default function ScrollJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 25,
    restDelta: 0.001
  });

  // Calculate animated metrics along scroll progress
  const pathLength = useTransform(smoothProgress, [0.1, 0.8], [0, 1]);
  const planeY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);
  const planeRotate = useTransform(smoothProgress, [0, 0.5, 1], [0, 15, 0]);

  // Translate coordinates for floating 3D parallax offsets
  const parallaxLeft = useTransform(smoothProgress, [0, 1], [-20, 20]);
  const parallaxRight = useTransform(smoothProgress, [0, 1], [20, -20]);

  return (
    <div
      ref={containerRef}
      className="relative max-w-5xl mx-auto px-4 py-20 overflow-hidden select-none"
    >
      <div className="text-center mb-16 space-y-4">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3.5 py-1 rounded-full inline-block">
          ✦ Interactive Journey Narrative ✦
        </span>
        <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight">
          How Vagabond Curates Your Trip
        </h2>
        <p className="max-w-xl mx-auto text-sm sm:text-base text-foreground-secondary font-medium">
          Follow the flight path to see how our Morphic AI compiles your travel journal.
        </p>
      </div>

      {/* Parallax elements */}
      <motion.div 
        style={{ x: parallaxLeft, y: parallaxLeft }}
        className="absolute top-24 left-4 h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border shadow-md text-primary flex hover:scale-110 transition duration-300 pointer-events-none z-floating"
      >
        <Globe className="h-6 w-6" />
      </motion.div>

      <motion.div 
        style={{ x: parallaxRight, y: parallaxRight }}
        className="absolute bottom-28 right-8 h-14 w-14 items-center justify-center rounded-2xl bg-card border border-border shadow-md text-accent flex hover:scale-110 transition duration-300 pointer-events-none z-floating"
      >
        <Plane className="h-6 w-6" />
      </motion.div>

      {/* SVG Timeline Path */}
      <div className="relative grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* Timeline Line (Center for large, left for small) */}
        <div className="absolute left-6 md:left-1/2 top-0 bottom-0 -translate-x-1/2 w-1 pointer-events-none">
          {/* Base Gray Path Line */}
          <div className="absolute inset-0 bg-border/55 rounded-full"></div>
          
          {/* Active SVG path drawing */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
            <motion.line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="var(--primary)"
              strokeWidth="4"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>

          {/* Plane marker riding the scroll path */}
          <motion.div
            style={{ 
              top: planeY,
              rotate: planeRotate,
            }}
            className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/35 border-2 border-white z-floating"
          >
            <Plane className="h-4 w-4" />
          </motion.div>
        </div>

        {/* Narrative Steps */}
        
        {/* Step 1 (Right Content) */}
        <div className="md:col-start-7 md:col-span-6 pl-14 md:pl-10 relative">
          <div className="absolute left-4 md:-left-[24px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border shadow-md font-bold text-xs text-foreground z-floating">
            1
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-md hover:border-primary/45 transition-all duration-300 space-y-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">Step One</span>
            <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
              <Compass className="h-5 w-5 text-primary" /> Select Destination
            </h3>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-medium">
              Feed our planner form with dates, party sizes, and custom interest categories.
            </p>
          </div>
        </div>

        {/* Spacer for step alignment */}
        <div className="hidden md:block md:col-span-12 h-6"></div>

        {/* Step 2 (Left Content) */}
        <div className="md:col-span-6 pr-0 md:pr-10 pl-14 md:pl-0 relative md:text-right">
          <div className="absolute left-4 md:right-[-24px] md:left-auto top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border shadow-md font-bold text-xs text-foreground z-floating">
            2
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-md hover:border-primary/45 transition-all duration-300 space-y-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">Step Two</span>
            <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2 md:justify-end">
              <Utensils className="h-5 w-5 text-primary" /> Curating Dining & Sights
            </h3>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-medium">
              Vagabond queries coordinates for local landmarks, historical spots, and breakfast/lunch/dinner reservations.
            </p>
          </div>
        </div>

        {/* Spacer for step alignment */}
        <div className="hidden md:block md:col-span-12 h-6"></div>

        {/* Step 3 (Right Content) */}
        <div className="md:col-start-7 md:col-span-6 pl-14 md:pl-10 relative">
          <div className="absolute left-4 md:-left-[24px] top-4 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-border shadow-md font-bold text-xs text-foreground z-floating">
            3
          </div>
          <div className="bg-card border border-border p-6 rounded-2xl shadow-md hover:border-primary/45 transition-all duration-300 space-y-2">
            <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest block">Step Three</span>
            <h3 className="font-heading text-lg font-extrabold text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent animate-bounce" /> Route Mapping
            </h3>
            <p className="text-xs sm:text-sm text-foreground-secondary leading-relaxed font-medium">
              Calculates routing coordinates dynamically to compile a linear day-by-day map journey.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
