import { isWeekend, format, getDay } from "date-fns";
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

const timeInRange = (start: string, end: string, check: string) => {
  return (
    start.slice(0, 5) <= check.slice(0, 5) &&
    check.slice(0, 5) < end.slice(0, 5)
  );
};

export function isPeakSlot(
  date: Date,
  startTime: string,
  peakHours: PeakHour[]
): PeakHour | undefined {
  const formattedDate = format(date, "yyyy-MM-dd");
  const dayIndex = getDay(date).toString(); // 0 = Sunday, 1 = Monday, etc.

  return peakHours.find((entry) => {
    if (entry.type === "date") {
      return (
        entry.specificDate === formattedDate &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    if (entry.type === "day") {
      return (
        entry.daysOfWeek?.includes(dayIndex) &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    return false;
  });
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

  // Check if there's a matching peak hour
  const peakEntry = isPeakSlot(date, startTime, peakHours);

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
