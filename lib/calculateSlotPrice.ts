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

const daysMap = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export function isPeakSlot(
  date: Date,
  startTime: string,
  peakHours: PeakHour[]
): PeakHour | undefined {
  const formattedDate = format(date, "yyyy-MM-dd");
  const dayIndex = getDay(date); // 0 = Sunday, 1 = Monday, etc.
  const dayName = daysMap[dayIndex];

  return peakHours.find((entry) => {
    if (entry.type === "date") {
      return (
        entry.specificDate === formattedDate &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    if (entry.type === "day") {
      // entry.daysOfWeek stores ["Monday", "Tuesday", ...], so we must match dayName
      return (
        entry.daysOfWeek?.includes(dayName) &&
        timeInRange(entry.startTime, entry.endTime, startTime)
      );
    }

    return false;
  });
}

interface PricingRule {
  startTime: string;
  endTime: string;
  price: number;
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

  // 1. Check Specific Peak Hour Overrides (Highest Priority)
  const peakEntry = isPeakSlot(date, startTime, peakHours);
  if (peakEntry) {
    return Number(peakEntry.price);
  }

  const isWeekendDay = isWeekend(date);

  // 2. Check Dynamic Pricing Rules
  let rules: PricingRule[] | undefined | null = [];

  if (isWeekendDay && turf.isWeekendPricingEnabled) {
    rules = turf.weekendRules as PricingRule[] | undefined | null;
  } else if (!isWeekendDay && turf.isWeekdayPricingEnabled) {
    rules = turf.weekdayRules as PricingRule[] | undefined | null;
  }

  if (rules && Array.isArray(rules)) {
    const match = rules.find((rule) =>
      timeInRange(rule.startTime, rule.endTime, startTime)
    );
    if (match) {
      return Number(match.price);
    }
  }

  // 3. Base Price
  // If no rules match and no peak override, return base price.
  return Number(turf.pricePerHour);
}
