import { format, parse } from "date-fns";

export function formatToAMPM(time: string | undefined): string {
  if (!time) return "";

  try {
    const parsed = parse(time, "HH:mm:ss", new Date());
    if (isNaN(parsed.getTime())) return ""; // invalid date
    return format(parsed, "h:mm a");
  } catch {
    return "";
  }
}

export function formatTo24Hour(time: string): string {
  try {
    const parsed = parse(time, "h:mm a", new Date());
    return format(parsed, "HH:mm:ss");
  } catch {
    return "";
  }
}

export const generateTimeSlots = (interval: number = 30) => {
  const times = [];
  const totalMinutes = 24 * 60;

  for (let i = 0; i < totalMinutes; i += interval) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;

    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    const period = hours < 12 ? "AM" : "PM";

    const label = `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
    const value = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    times.push({ value, label });
  }

  return times;
};
