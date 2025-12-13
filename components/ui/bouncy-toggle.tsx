"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface PremiumToggleProps {
  defaultChecked?: boolean;
  checked?: boolean; // Added for controlled usage
  onChange?: (checked: boolean) => void;
  label?: string;
}

export function PremiumToggle({
  defaultChecked = false,
  checked,
  onChange,
  label,
}: PremiumToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const [isPressed, setIsPressed] = useState(false);

  // Sync internal state with controlled prop if present
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    // If NOT controlled, update internal state
    if (checked === undefined) {
      setInternalChecked(!internalChecked);
    }
    // Always notify parent
    onChange?.(!isChecked);
  };

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            isChecked ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {label}
        </span>
      )}
      <button
        role="switch"
        aria-checked={isChecked}
        type="button" // Prevent form submission
        onClick={handleToggle}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onMouseLeave={() => setIsPressed(false)}
        className={cn(
          "group relative h-8 w-14 rounded-full p-1 transition-all duration-500 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          isChecked ? "bg-white" : "bg-white/10" // Adapted for dark theme: white when active (neon handled inside?) or match provided styles
        )}
      >
        {/* Glow effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-full transition-opacity duration-500",
            isChecked
              ? "opacity-100 shadow-[0_0_20px_rgba(204,255,0,0.4)]"
              : "opacity-0"
          )}
        />

        {/* Track inner gradient */}
        <div
          className={cn(
            "absolute inset-[2px] rounded-full transition-all duration-500",
            isChecked
              ? "bg-gradient-to-b from-turf-neon to-turf-neon/90"
              : "bg-transparent"
          )}
        />

        {/* Thumb */}
        <div
          className={cn(
            "relative h-6 w-6 rounded-full shadow-lg transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)]",
            "bg-black",
            isChecked ? "translate-x-6" : "translate-x-0",
            isPressed && "scale-90 duration-150"
          )}
        >
          {/* Thumb inner shine */}
          <div className="absolute inset-[2px] rounded-full bg-gradient-to-b from-black via-black to-white/10" />

          {/* Status indicator dot */}
          <div
            className={cn(
              "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500",
              isChecked
                ? "h-2 w-2 bg-turf-neon opacity-100 scale-100"
                : "h-1.5 w-1.5 bg-gray-500 opacity-100 scale-100"
            )}
          />

          {/* Ripple */}
          <div
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-700",
              isChecked
                ? "animate-ping bg-turf-neon/30 scale-150 opacity-0"
                : "scale-100 opacity-0"
            )}
            key={isChecked ? "on" : "off"}
          />
        </div>
      </button>
    </div>
  );
}
