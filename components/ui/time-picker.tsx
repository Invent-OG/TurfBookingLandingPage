"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimePickerProps {
  date?: Date; // Optional date context if needed later
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TimePicker({ value, onChange, className }: TimePickerProps) {
  const times = React.useMemo(() => {
    const timeArray = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour = i.toString().padStart(2, "0");
        const minute = j.toString().padStart(2, "0");
        timeArray.push(`${hour}:${minute}`);
      }
    }
    return timeArray;
  }, []);

  return (
    <Select value={value?.slice(0, 5)} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          "w-full bg-white/5 border-white/10 text-white focus:ring-turf-neon",
          className
        )}
      >
        <div className="flex items-center gap-2 flex-1 text-left">
          <Clock className="w-4 h-4 text-turf-neon shrink-0" />
          <span className="text-white flex-1">
            {value ? value.slice(0, 5) : "Pick a time"}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-turf-dark border-white/10 text-white max-h-60 overflow-y-auto z-[200]">
        {times.map((time) => (
          <SelectItem
            key={time}
            value={time}
            className="focus:bg-turf-neon/20 focus:text-turf-neon"
          >
            {time}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
