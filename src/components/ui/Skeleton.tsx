import React from "react";

interface SkeletonProps {
  className?: string;
  glowVariant?: "primary" | "secondary" | "accent";
}

const GLOW_MAP = {
  primary: "via-[#D946EF]/20",
  secondary: "via-cyan-400/20",
  accent: "via-amber-400/20",
};

export function Skeleton({ className = "", glowVariant = "primary" }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-slate-800/30 border border-white/5 rounded-xl ${className}`}
    >
      <div 
        className={`absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent ${GLOW_MAP[glowVariant]} to-transparent`}
      ></div>
    </div>
  );
}
