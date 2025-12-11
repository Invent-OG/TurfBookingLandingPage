"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
import { Button } from "./button";

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  label?: string;
  disabled?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
  className,
  label,
  disabled = false,
}: NumberInputProps) {
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && value < max) {
      onChange(Math.min(value + step, max));
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled && value > min) {
      onChange(Math.max(value - step, min));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= min && val <= max) {
      onChange(val);
    } else if (e.target.value === "") {
      onChange(min);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-1.5",
        className,
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {label && (
        <label className="text-sm font-medium text-gray-400">{label}</label>
      )}
      <div
        className={cn(
          "flex items-center bg-white/5 border border-white/10 rounded-md overflow-hidden transition-all",
          !disabled && "focus-within:ring-1 focus-within:ring-turf-neon"
        )}
      >
        <Button
          variant="ghost"
          type="button"
          className="h-10 w-10 px-0 rounded-none bg-transparent hover:bg-white/10 text-turf-neon active:scale-95 transition-transform"
          onClick={handleDecrement}
          disabled={disabled || value <= min}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <div className="flex-1 h-10 border-l border-r border-white/10">
          <input
            type="number"
            value={value}
            onChange={handleChange}
            disabled={disabled}
            className="w-full h-full bg-transparent text-center text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-mono disabled:cursor-not-allowed"
          />
        </div>
        <Button
          variant="ghost"
          type="button"
          className="h-10 w-10 px-0 rounded-none bg-transparent hover:bg-white/10 text-turf-neon active:scale-95 transition-transform"
          onClick={handleIncrement}
          disabled={disabled || value >= max}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
