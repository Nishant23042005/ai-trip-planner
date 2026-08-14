import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
  hoverEffect?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  strong = false,
  hoverEffect = true,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={`rounded-[28px] border border-border transition-all duration-300 relative overflow-hidden ${
        strong
          ? "bg-card backdrop-blur-[28px] shadow-glass-strong"
          : "bg-card/95 backdrop-blur-[20px] shadow-glass"
      } ${
        hoverEffect
          ? "hover:border-primary/50 hover:bg-card-hover hover:-translate-y-1 hover:shadow-2xl"
          : ""
      } ${className}`}
      {...props}
    >
      {/* Soft inner highlight layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-[28px]" />
      {children}
    </div>
  );
}
