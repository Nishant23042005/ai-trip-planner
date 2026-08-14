import React from "react";

interface GlassBadgeProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "accent" | "muted";
  className?: string;
}

export default function GlassBadge({
  children,
  icon,
  variant = "primary",
  className = "",
}: GlassBadgeProps) {
  const variantStyles = {
    primary: "bg-badge-teal-bg text-badge-teal-text border-primary/20 font-extrabold",
    secondary: "bg-badge-blue-bg text-badge-blue-text border-secondary/20 font-extrabold",
    accent: "bg-badge-amber-bg text-badge-amber-text border-accent/20 font-extrabold",
    muted: "bg-card text-foreground-secondary border-border font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-md px-3.5 py-1 text-[10px] sm:text-xs uppercase tracking-wider shadow-sm ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
