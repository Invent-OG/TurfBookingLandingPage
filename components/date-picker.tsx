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
    <div className="bg-white w-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold">{monthLabel}</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarDays />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
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
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleScroll("left")}>
            <ChevronLeft />
          </Button>
          <Button variant="outline" onClick={() => handleScroll("right")}>
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div
          className="flex overflow-x-auto gap-2 no-scrollbar"
          ref={containerRef}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {Array.from({ length: totalDays }, (_, i) => {
            const date = addDays(today, i);
            const isDisabled = isDateDisabled(date);

            return (
              <div
                key={i}
                data-date={date.toISOString()}
                className={`flex flex-col items-center justify-center select-none min-w-[70px] h-20 rounded-lg shadow 
                  ${
                    isSameDay(selectedDate || today, date)
                      ? "bg-black text-white"
                      : "border text-black"
                  }
                  ${
                    isDisabled
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
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
                <span
                  className={cn(
                    isSameDay(selectedDate || today, date)
                      ? "bg-black text-white"
                      : " text-gray-400",
                    "text-sm"
                  )}
                >
                  {weekdays[date.getDay()]}
                </span>
                <span className="text-lg font-bold">{date.getDate()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DateSelector;
