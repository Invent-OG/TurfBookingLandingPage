"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  className?: string;
}

export function DatePicker({ date, setDate, className }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-turf-neon focus:ring-1 focus:ring-turf-neon transition-colors",
            !date && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-turf-neon" />
          {date ? format(date, "MMM d, yyyy") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-turf-dark border-white/10 text-white shadow-[0_0_20px_rgba(0,0,0,0.5)]">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="p-3"
          classNames={{
            day_selected:
              "bg-turf-neon text-black hover:bg-turf-neon hover:text-black focus:bg-turf-neon focus:text-black",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
