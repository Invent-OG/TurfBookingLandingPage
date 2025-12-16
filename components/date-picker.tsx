"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  format,
  isSameDay,
  startOfMonth,
  isWithinInterval,
  addDays,
  differenceInDays,
} from "date-fns";
import gsap from "gsap";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DateSelectorProps = {
  maxDate?: Date;
  disabledDates?: Date[];
  disabledRanges?: { start: Date; end: Date }[];
  onDateSelect?: (date: Date | null) => void;
  defauledDate?: Date;
};

const DateSelector: React.FC<DateSelectorProps> = ({
  maxDate,
  disabledDates,
  disabledRanges,
  onDateSelect,
  defauledDate,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(today);
  const [monthLabel, setMonthLabel] = useState(format(today, "MMMM yyyy"));
  const [openMonth, setOpenMonth] = useState<Date>(startOfMonth(today));
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedDateRef = useRef<Date | null>(today);

  useEffect(() => {
    setMonthLabel(format(openMonth, "MMMM yyyy"));
  }, [openMonth]);

  useEffect(() => {
    if (selectedDate) {
      setOpenMonth(startOfMonth(selectedDate));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDateRef.current) {
      setTimeout(() => scrollToSelectedDate(selectedDateRef.current!), 100);
    }
  }, []);

  const totalDays = (maxDate ? differenceInDays(maxDate, today) : 0) + 1;
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Function to check if a date is disabled
  const isDateDisabled = (date: Date) => {
    const normalizedDate = new Date(date);
    normalizedDate.setHours(0, 0, 0, 0);

    return (
      // Disable past dates (except today itself)
      (normalizedDate < today && !isSameDay(normalizedDate, today)) ||
      // Disable dates after maxDate (inclusive check)
      normalizedDate > (maxDate ?? new Date(9999, 11, 31)) ||
      // Disable specific dates
      (disabledDates ?? []).some((d) => isSameDay(d, normalizedDate)) ||
      // Disable date ranges, including the start date
      (disabledRanges ?? []).some(
        (range) =>
          isWithinInterval(normalizedDate, {
            start: range.start,
            end: range.end,
          }) || isSameDay(normalizedDate, range.start) // Disable the start date of the range as well
      )
    );
  };

  const scrollToSelectedDate = (date: Date) => {
    if (containerRef.current) {
      const dateElements = Array.from(
        containerRef.current.children
      ) as HTMLElement[];
      const selectedElement = dateElements.find(
        (el) => el.dataset.date === date.toISOString()
      );
      if (selectedElement) {
        gsap.to(containerRef.current, {
          scrollLeft:
            selectedElement.offsetLeft -
            containerRef.current.offsetWidth / 2 +
            selectedElement.clientWidth / 2,
          duration: 0.5,
          ease: "power2.out",
        });
      }
    }
  };

  const handleScroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 250;
      gsap.to(containerRef.current, {
        scrollLeft:
          direction === "left" ? `-=${scrollAmount}` : `+=${scrollAmount}`,
        duration: 0.5,
        ease: "power2.out",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold text-white tracking-tight">
            {monthLabel}
          </span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-turf-neon hover:bg-turf-neon/10 hover:text-turf-neon"
              >
                <CalendarDays className="w-5 h-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-turf-dark border border-white/10 text-white">
              <Calendar
                mode="single"
                // selected={selectedDate || undefined}
                selected={defauledDate}
                onSelect={(date) => {
                  if (date && !isDateDisabled(date)) {
                    setSelectedDate(date);
                    setOpenMonth(startOfMonth(date));
                    setMonthLabel(format(startOfMonth(date), "MMMM yyyy"));
                    selectedDateRef.current = date;
                    onDateSelect?.(date);
                    setTimeout(() => scrollToSelectedDate(date), 100);
                  }
                }}
                month={openMonth}
                onMonthChange={(newMonth) => {
                  setOpenMonth(newMonth);
                  setMonthLabel(format(newMonth, "MMMM yyyy"));
                }}
                disabled={(date) => isDateDisabled(date)}
                className="bg-black/90 text-white border-none"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("left")}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-turf-neon/50 hover:text-turf-neon transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleScroll("right")}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-turf-neon/50 hover:text-turf-neon transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex overflow-x-auto gap-3 no-scrollbar py-2"
          ref={containerRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Array.from({ length: totalDays }, (_, i) => {
            const date = addDays(today, i);
            const isDisabled = isDateDisabled(date);
            const isSelected = isSameDay(selectedDate || today, date);

            return (
              <div
                key={i}
                data-date={date.toISOString()}
                className={`flex flex-col items-center justify-center select-none min-w-[72px] h-24 rounded-sm skew-x-[-10deg] transition-all duration-300 border
                  ${
                    isSelected
                      ? "bg-turf-neon border-turf-neon text-black shadow-[0_0_15px_-3px_rgba(204,255,0,0.5)] scale-105 z-10"
                      : "bg-black/60 border-white/10 text-gray-400 hover:border-turf-neon/50 hover:bg-white/5 hover:text-white"
                  }
                  ${
                    isDisabled
                      ? "opacity-30 cursor-not-allowed bg-black/40 border-transparent"
                      : "cursor-pointer"
                  }
                `}
                onClick={() => {
                  if (!isDisabled) {
                    setSelectedDate(date);
                    setOpenMonth(startOfMonth(date));
                    setMonthLabel(format(startOfMonth(date), "MMMM yyyy"));
                    selectedDateRef.current = date;
                    onDateSelect?.(date);
                    setTimeout(() => scrollToSelectedDate(date), 100);
                  }
                }}
              >
                <div className="skew-x-[10deg] flex flex-col items-center">
                  <span
                    className={cn(
                      "text-[10px] mb-1 uppercase tracking-widest font-bold",
                      isSelected ? "text-black" : "text-gray-500"
                    )}
                  >
                    {weekdays[date.getDay()]}
                  </span>
                  <span
                    className={cn(
                      "text-2xl font-black font-heading italic",
                      isSelected ? "text-black" : "text-white"
                    )}
                  >
                    {date.getDate()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
