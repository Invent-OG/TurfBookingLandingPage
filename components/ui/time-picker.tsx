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
  minTime?: string; // format: "HH:mm"
  maxTime?: string; // format: "HH:mm"
}

export function TimePicker({
  value,
  onChange,
  className,
  minTime,
  maxTime,
}: TimePickerProps) {
  const times = React.useMemo(() => {
    const timeArray = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 15) {
        const hour24 = i.toString().padStart(2, "0");
        const minute = j.toString().padStart(2, "0");
        const timeValue = `${hour24}:${minute}`;

        // Filter based on minTime and maxTime if provided
        let isVisible = true;
        if (minTime && timeValue < minTime) isVisible = false;
        if (maxTime && maxTime !== "00:00" && timeValue > maxTime)
          isVisible = false;

        if (isVisible) {
          const ampm = i >= 12 ? "PM" : "AM";
          const hour12 = i % 12 || 12;
          const label = `${hour12}:${minute} ${ampm}`;
          timeArray.push({ value: timeValue, label });
        }
      }
    }
    return timeArray;
  }, [minTime, maxTime]);

  const selectedTime = React.useMemo(() => {
    return times.find((t) => t.value === value?.slice(0, 5));
  }, [times, value]);

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
            {selectedTime ? selectedTime.label : "Pick a time"}
          </span>
        </div>
      </SelectTrigger>
      <SelectContent className="bg-turf-dark border-white/10 text-white max-h-60 overflow-y-auto z-[200]">
        {times.length > 0 ? (
          times.map((time) => (
            <SelectItem
              key={time.value}
              value={time.value}
              className="focus:bg-turf-neon/20 focus:text-turf-neon"
            >
              {time.label}
            </SelectItem>
          ))
        ) : (
          <div className="p-2 text-center text-gray-500 text-sm">
            No slots available
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
