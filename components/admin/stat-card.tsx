"use client";

import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React, { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "neon" | "blue" | "white";
  className?: string;
  loading?: boolean;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = "neon",
  className,
  loading,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Simple count-up animation for numbers
  useEffect(() => {
    if (typeof value === "number" && !loading) {
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [value, loading]);

  const colors = {
    neon: "text-turf-neon shadow-neon-green",
    blue: "text-white shadow-glass", // Fallback for blue to white
    white: "text-white shadow-glass",
  };

  const iconColors = {
    neon: "bg-turf-neon/10 text-turf-neon",
    blue: "bg-white/10 text-white", // Fallback for blue to white
    white: "bg-white/10 text-white",
  };

  return (
    <div
      className={cn(
        "glass-panel p-6 rounded-2xl relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300",
        className
      )}
    >
      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-white/10" />
            <div className="w-12 h-5 rounded-full bg-white/10" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-4 rounded bg-white/10" />
            <div className="w-32 h-8 rounded bg-white/10" />
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-3 rounded-xl", iconColors[color])}>
              <Icon size={24} className="drop-shadow-[0_0_8px_currentColor]" />
            </div>
            {trend && (
              <span
                className={cn(
                  "text-xs font-bold px-2 py-1 rounded-full",
                  trend.isPositive
                    ? "bg-green-500/20 text-green-400"
                    : "bg-red-500/20 text-red-400"
                )}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h4 className="text-gray-400 text-sm font-medium">{title}</h4>
            <div className="text-2xl font-bold text-white font-heading">
              {typeof value === "number"
                ? displayValue.toLocaleString()
                : value}
            </div>
          </div>
        </>
      )}

      {/* Background Glow Element */}
      <div
        className={cn(
          "absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-[50px] opacity-10 transition-opacity group-hover:opacity-20",
          color === "neon"
            ? "bg-turf-neon"
            : color === "blue"
              ? "bg-turf-blue"
              : "bg-white"
        )}
      />
    </div>
  );
}
