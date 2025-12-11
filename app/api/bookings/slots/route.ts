// import { NextResponse } from "next/server";
// import { bookings, turfs, blockedDates } from "@/db/schema";
// import { eq, and, lt, or } from "drizzle-orm";
// import { db } from "@/db/db";

// // Convert HH:mm:ss to total minutes from midnight
// const timeToMinutes = (time: string): number => {
//   const [hours, minutes] = time.split(":").map(Number);
//   return hours * 60 + minutes;
// };

// // Convert total minutes back to HH:mm:ss
// const minutesToTime = (totalMinutes: number): string => {
//   const hours = Math.floor(totalMinutes / 60);
//   const minutes = totalMinutes % 60;
//   return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
//     2,
//     "0"
//   )}:00`;
// };

// // GET available slots for a turf on a given date
// export async function GET(req: Request) {
//   try {
//     const url = new URL(req.url);
//     const turfId = url.searchParams.get("turfId");
//     const date = url.searchParams.get("date");
//     const localTime = url.searchParams.get("localTime"); // User's browser local time (HH:mm:ss)

//     if (!turfId || !date || !localTime) {
//       return NextResponse.json(
//         { error: "Missing parameters" },
//         { status: 400 }
//       );
//     }

//     // Convert local time (browser time) to minutes
//     const localMinutes = timeToMinutes(localTime);

//     // Get turf details
//     const turf = await db
//       .select()
//       .from(turfs)
//       .where(eq(turfs.id, turfId))
//       .limit(1);
//     if (turf.length === 0)
//       return NextResponse.json({ error: "Turf not found" }, { status: 404 });

//     const { openingTime, closingTime } = turf[0];
//     const slotDuration = 60; // Default slot duration in minutes

//     // Convert opening and closing times to minutes
//     const openingMinutes = timeToMinutes(openingTime);
//     const closingMinutes = timeToMinutes(closingTime);
//     const lastBookingStartMinutes = closingMinutes - slotDuration; // 1 hour before closing

//     // Check if the selected date is today
//     const today = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
//     const isToday = date === today;

//     // ✅ Delete "pending" bookings older than 5 minutes
//     const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
//     await db
//       .delete(bookings)
//       .where(
//         and(
//           eq(bookings.turfId, turfId),
//           lt(bookings.createdAt, fiveMinutesAgo),
//           or(
//             eq(bookings.status, "pending"),
//             eq(bookings.status, "payment_failed")
//           )
//         )
//       );

//     // Get booked slots for the date
//     const bookedSlots = await db
//       .select({ startTime: bookings.startTime, duration: bookings.duration })
//       .from(bookings)
//       .where(
//         and(eq(bookings.turfId, turfId), eq(bookings.date, date.split("T")[0]))
//       );

//     // Get blocked times
//     const blockedSlots = await db
//       .select({ blockedTimes: blockedDates.blockedTimes })
//       .from(blockedDates)
//       .where(
//         and(
//           eq(blockedDates.turfId, turfId),
//           eq(blockedDates.startDate, date.split("T")[0])
//         )
//       );

//     const blockedTimesSet = new Set(
//       blockedSlots.flatMap((slot) => slot.blockedTimes || [])
//     );

//     // ✅ Generate available slots
//     const availableSlots = [];
//     let slotMinutes = openingMinutes;

//     while (slotMinutes <= lastBookingStartMinutes) {
//       const slotTime = minutesToTime(slotMinutes);

//       // ✅ Skip past slots if it's today (based on browser local time)
//       if (isToday && slotMinutes <= localMinutes) {
//         slotMinutes += slotDuration;
//         continue;
//       }

//       const isBooked = bookedSlots.some((slot) => {
//         const bookingStartMinutes = timeToMinutes(slot.startTime);
//         const bookingEndMinutes = bookingStartMinutes + slot.duration * 60;
//         return (
//           slotMinutes >= bookingStartMinutes && slotMinutes < bookingEndMinutes
//         );
//       });

//       const isBlocked = blockedTimesSet.has(slotTime);

//       availableSlots.push({
//         time: slotTime,
//         isBooked,
//         isBlocked,
//       });

//       // Move to the next slot
//       slotMinutes += slotDuration;
//     }

//     return NextResponse.json({ availableSlots }, { status: 200 });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

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
          or(
            eq(bookings.status, "pending"),
            eq(bookings.status, "payment_failed")
          )
        )
      );

    // Get booked slots (excluding cancelled/rejected)
    const bookedSlots = await db
      .select({ startTime: bookings.startTime, duration: bookings.duration })
      .from(bookings)
      .where(
        and(
          eq(bookings.turfId, turfId),
          eq(bookings.date, date.split("T")[0]),
          notInArray(bookings.status, ["cancelled", "rejected", "refunded"])
        )
      );

    // Get blocked times
    const blockedSlots = await db
      .select({ blockedTimes: blockedDates.blockedTimes })
      .from(blockedDates)
      .where(
        and(
          eq(blockedDates.turfId, turfId),
          eq(blockedDates.startDate, date.split("T")[0])
        )
      );

    // Get active events for this date
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

    // Check for full day block
    const isFullDayBlocked = blockedSlots.some(
      (slot) => !slot.blockedTimes || slot.blockedTimes.length === 0
    );

    const blockedTimesSet = new Set(
      blockedSlots.flatMap((slot) => slot.blockedTimes || [])
    );

    // Helper to check if a slot is blocked by an event
    const isBlockedByEvent = (slotMinutes: number) => {
      return activeEvents.some((event) => {
        const eventStart = timeToMinutes(event.startTime);
        const eventEnd = timeToMinutes(event.endTime);
        return slotMinutes >= eventStart && slotMinutes < eventEnd;
      });
    };

    const availableSlots = [];
    let slotMinutes = openingMinutes;

    while (slotMinutes <= lastBookingStartMinutes) {
      const slotTime = minutesToTime(slotMinutes);

      if (isToday && slotMinutes <= localMinutes) {
        slotMinutes += slotDuration;
        continue;
      }

      // Check if booked
      const isBooked = bookedSlots.some((slot) => {
        const bookingStart = timeToMinutes(slot.startTime);
        const bookingEnd = bookingStart + slot.duration * 60;
        return slotMinutes >= bookingStart && slotMinutes < bookingEnd;
      });

      // Check if blocked: full day blocked OR specific slot blocked
      const isBlocked =
        isFullDayBlocked ||
        blockedTimesSet.has(slotTime) ||
        blockedTimesSet.has(slotTime.slice(0, 5)) ||
        isBlockedByEvent(slotMinutes); // Check if blocked by event

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
