import { cn } from "@/lib/utils";
import React from "react";

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  glow?: boolean;
}

export const NeonButton = React.forwardRef<HTMLButtonElement, NeonButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "default",
      glow = true,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-turf-neon text-turf-dark hover:bg-turf-neon/90 hover:scale-105 active:scale-95",
      secondary:
        "bg-white text-black hover:bg-white/90 hover:scale-105 active:scale-95",
      danger: "bg-red-500 text-white hover:bg-red-600",
      ghost:
        "bg-transparent text-gray-300 border border-white/10 hover:bg-white/5 hover:text-white",
    };

    const sizes = {
      default: "px-6 py-2.5",
      sm: "px-4 py-2 text-sm",
      lg: "px-8 py-3 text-lg",
      icon: "h-10 w-10 p-2 flex items-center justify-center",
    };

    const glows = {
      primary:
        "shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:shadow-[0_0_30px_rgba(204,255,0,0.5)]",
      secondary:
        "shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]",
      danger: "shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      ghost: "",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          glow ? glows[variant] : "",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
NeonButton.displayName = "NeonButton";
