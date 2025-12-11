import { isWeekend, format } from "date-fns";
import { Turf } from "@/types/turf";
import { PeakHour } from "@/hooks/use-peak-hours";

interface CalculatePriceArgs {
  turf: Turf | null;
  date: Date;
  startTime: string; // in "HH:mm" format
  peakHours: PeakHour[];
}

// function timeInRange(start: string, end: string, check: string): boolean {
//   return start <= check && check < end;
// }

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

  const timeInRange = (start: string, end: string, check: string) => {
    return start <= check && check < end;
  };

  // Check if there's a matching peak hour
  const peakEntry = peakHours.find((entry) => {
    if (entry.type === "date") {
      return (
        entry.specificDate === formattedDate &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    if (entry.type === "day") {
      return (
        entry.daysOfWeek?.includes(dayOfWeek) &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    return false;
  });

  if (peakEntry) {
    return Number(peakEntry.price);
  }

  // Weekend pricing
  if (isWeekendDay && turf.isWeekendPricingEnabled) {
    if (
      timeInRange(
        turf.weekendMorningStart || "06:00", // Default fallback if null
        turf.weekendEveningStart || "18:00",
        startTime
      )
    ) {
      return Number(turf.weekendMorningPrice ?? turf.pricePerHour);
    } else {
      return Number(turf.weekendEveningPrice ?? turf.pricePerHour);
    }
  }

  // Weekday pricing
  if (!isWeekendDay && turf.isWeekdayPricingEnabled) {
    if (
      timeInRange(
        turf.weekdayMorningStart || "06:00",
        turf.weekdayEveningStart || "18:00",
        startTime
      )
    ) {
      return Number(turf.weekdayMorningPrice ?? turf.pricePerHour);
    } else {
      return Number(turf.weekdayEveningPrice ?? turf.pricePerHour);
    }
  }

  // Fallback default price
  return Number(turf.pricePerHour);
}
