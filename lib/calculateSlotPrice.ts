import { isWeekend, format } from "date-fns";
import { Turf } from "@/types/turf"; // adjust the import path based on your project
import { PeakHour } from "./store/peakHours";

interface CalculatePriceArgs {
  turf: Turf | null;
  date: Date;
  startTime: string; // in "HH:mm" format
  peakHours: PeakHour[];
}

function timeInRange(start: string, end: string, check: string): boolean {
  return start <= check && check < end;
}

export function calculateSlotPrice({
  turf,
  date,
  startTime,
  peakHours,
}: CalculatePriceArgs): number {
  if (!turf) {
    console.warn("No turf provided to calculateSlotPrice");
    return 0;
  }

  const isWeekendDay = isWeekend(date);
  const formattedDate = format(date, "yyyy-MM-dd");
  const dayOfWeek = format(date, "EEEE"); // e.g., "Monday"

  // Check if there's a matching peak hour
  const peakEntry = peakHours.find((entry) => {
    if (entry.type === "date") {
      return (
        entry.specific_date === formattedDate &&
        timeInRange(entry.start_time, entry.end_time, startTime)
      );
    }

    if (entry.type === "day") {
      return (
        entry.days_of_week?.includes(dayOfWeek) &&
        timeInRange(entry.start_time, entry.end_time, startTime)
      );
    }

    return false;
  });

  if (peakEntry) {
    return Number(peakEntry.price);
  }

  // Weekend pricing
  if (isWeekendDay && turf.is_weekend_pricing_enabled) {
    if (
      timeInRange(
        turf.weekend_morning_start,
        turf.weekend_evening_start,
        startTime
      )
    ) {
      return Number(turf.weekend_morning_price ?? turf.price_per_hour);
    } else {
      return Number(turf.weekend_evening_price ?? turf.price_per_hour);
    }
  }

  // Weekday pricing
  if (!isWeekendDay && turf.is_weekday_pricing_enabled) {
    if (
      timeInRange(
        turf.weekday_morning_start,
        turf.weekday_evening_start,
        startTime
      )
    ) {
      return Number(turf.weekday_morning_price ?? turf.price_per_hour);
    } else {
      return Number(turf.weekday_evening_price ?? turf.price_per_hour);
    }
  }

  // Fallback default price
  return Number(turf.price_per_hour);
}
