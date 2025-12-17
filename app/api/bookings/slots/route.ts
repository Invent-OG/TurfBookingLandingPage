import { NextResponse } from "next/server";
import { bookings, turfs, blockedDates, events } from "@/db/schema";
import { eq, and, lt, or, notInArray, lte, gte } from "drizzle-orm";
import { db } from "@/db/db";

// Convert HH:mm:ss to total minutes from midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert total minutes back to HH:mm:ss
const minutesToTime = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:00`;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const turfId = url.searchParams.get("turfId");
    const date = url.searchParams.get("date");
    const localTime = url.searchParams.get("localTime");
    const slotParam = url.searchParams.get("slotDuration");

    if (!turfId || !date || !localTime) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const localMinutes = timeToMinutes(localTime);

    // Get turf details
    const turf = await db
      .select()
      .from(turfs)
      .where(eq(turfs.id, turfId))
      .limit(1);

    if (turf.length === 0)
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });

    const { openingTime, closingTime, slotInterval } = turf[0];

    // Get slot duration from query param or turf default
    const slotDuration = slotParam
      ? parseInt(slotParam, 10)
      : slotInterval || 60;

    // Convert opening and closing times
    const openingMinutes = timeToMinutes(openingTime);
    const closingMinutes = timeToMinutes(closingTime);
    const lastBookingStartMinutes = closingMinutes - slotDuration;

    const today = new Date().toISOString().split("T")[0];
    const isToday = date === today;

    // Delete pending/payment_failed bookings older than 5 mins
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    await db
      .delete(bookings)
      .where(
        and(
          eq(bookings.turfId, turfId),
          lt(bookings.createdAt, fiveMinutesAgo),
          or(eq(bookings.status, "pending"), eq(bookings.status, "expired"))
        )
      );

    // Get booked slots (excluding cancelled/rejected/expired)
    // AND checking for valid locks
    const bookedSlots = await db
      .select({
        startTime: bookings.startTime,
        endTime: bookings.endTime, // Use DB endTime
        duration: bookings.duration,
        status: bookings.status,
        lockedUntil: bookings.lockedUntil,
      })
      .from(bookings)
      .where(
        and(
          eq(bookings.turfId, turfId),
          eq(bookings.date, date.split("T")[0]),
          notInArray(bookings.status, ["cancelled", "expired"])
        )
      );

    // Get blocked ranges
    const blockedData = await db
      .select({
        blockedTimes: blockedDates.blockedTimes,
        blockedRanges: blockedDates.blockedRanges,
      })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.turfId, turfId),
          eq(blockedDates.startDate, date.split("T")[0])
        )
      );

    // Flatten blocked ranges
    const blockedRanges: { start: string; end: string }[] = [];
    const blockedTimesSet = new Set<string>();

    blockedData.forEach((entry) => {
      if (entry.blockedRanges) {
        (entry.blockedRanges as { start: string; end: string }[]).forEach((r) =>
          blockedRanges.push(r)
        );
      }
      // Backward compatibility
      if (entry.blockedTimes) {
        entry.blockedTimes.forEach((t) => blockedTimesSet.add(t));
      }
      // If whole day block (empty arrays/nulls but row exists?)
      // The previous logic for whole day block was: (!blockedTimes || length===0).
      // We should replicate that or rely on specific whole-day flag if we had one.
      // For now, if blockedRanges is empty AND blockedTimes is empty, assume FULL DAY BLOCK?
      // Or did we change that? The schema migration might have fixed it.
      // Let's assume explicit ranges or times mean partial, empty means potentially full if logic dictated.
      // Actually, previous logic said "if (!entry.blockedTimes || length === 0) throw error (full day)".
      // So we keep that logic but check ranges too.
      if (
        (!entry.blockedTimes || entry.blockedTimes.length === 0) &&
        (!entry.blockedRanges || (entry.blockedRanges as any[]).length === 0)
      ) {
        // Full day block
        // We can hack this by adding 00:00-24:00 range
        blockedRanges.push({ start: "00:00", end: "23:59" });
      }
    });

    // Active Events
    const activeEvents = await db
      .select()
      .from(events)
      .where(
        and(
          eq(events.turfId, turfId),
          lte(events.startDate, date.split("T")[0]),
          gte(events.endDate, date.split("T")[0]),
          notInArray(events.status, ["cancelled"])
        )
      );

    const availableSlots = [];
    let slotMinutes = openingMinutes;
    const now = new Date(); // To check locks

    while (slotMinutes <= lastBookingStartMinutes) {
      const slotTime = minutesToTime(slotMinutes);
      const slotEndMinutes = slotMinutes + slotDuration;
      const slotEndTime = minutesToTime(slotEndMinutes);

      if (isToday && slotMinutes <= localMinutes) {
        slotMinutes += slotDuration;
        continue;
      }

      // 1. Check Booking Overlaps
      const isBooked = bookedSlots.some((book) => {
        // If pending, check lock
        if (book.status === "pending" && book.lockedUntil) {
          if (new Date(book.lockedUntil) < now) return false; // Expired lock, ignore
        }

        const bStart = timeToMinutes(book.startTime);
        // Use endTime if avail, else calc
        const bEnd = book.endTime
          ? timeToMinutes(book.endTime)
          : bStart + book.duration * 60; // Use 60 or slotInterval? Duration is in integer units of... hours?
        // Wait, duration in bookings is usually HOURS based on usage in `addMinutes(start, duration * interval)`.
        // BUT `booking.duration` in schema is integer.
        // In previous code: `slotInterval * bookings.duration`.
        // So `duration` is "number of slots"? Or "hours"?
        // "duration" field usually implies "number of basic units".
        // Let's stick to using `book.endTime` if available, it's safer.
        // Prioritize `book.endTime`.

        // Overlap: StartA < EndB && EndA > StartB
        return slotMinutes < bEnd && slotEndMinutes > bStart;
      });

      // 2. Check Blocked Ranges/Times
      let isBlocked =
        blockedTimesSet.has(slotTime) ||
        blockedTimesSet.has(slotTime.slice(0, 5));

      if (!isBlocked) {
        isBlocked = blockedRanges.some((range) => {
          const rStart = timeToMinutes(range.start);
          const rEnd = timeToMinutes(range.end);
          return slotMinutes < rEnd && slotEndMinutes > rStart;
        });
      }

      // 3. Check Events
      if (!isBlocked) {
        isBlocked = activeEvents.some((event) => {
          const eventStart = timeToMinutes(event.startTime);
          const eventEnd = timeToMinutes(event.endTime);
          return slotMinutes >= eventStart && slotMinutes < eventEnd;
        });
      }

      availableSlots.push({
        time: slotTime,
        isBooked,
        isBlocked,
      });

      slotMinutes += slotDuration;
    }

    return NextResponse.json({ availableSlots }, { status: 200 });
  } catch (error) {
    console.error("❌ Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
