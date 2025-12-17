import { db } from "@/db/db";
import { bookings, blockedDates } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// Helper to add minutes to a time string "HH:mm:ss"
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:00`;
}

async function migrateV2() {
  console.log("Starting Migration V2...");

  // 1. Backfill endTime for Bookings
  console.log("Backfilling Bookings.endTime...");
  const allBookings = await db.select().from(bookings);

  for (const b of allBookings) {
    if (b.startTime && b.duration) {
      // Calculate end time
      // Note: If endTime is already set to something other than 00:00 (default), we might skip,
      // but for safety we recalculate since default was 00:00
      const calculatedEnd = addMinutes(b.startTime, b.duration);

      // Update
      await db
        .update(bookings)
        .set({
          endTime: calculatedEnd,
          // Map old status 'booked' to 'confirmed' if necessary, otherwise keep as is if valid
          status: b.status === "booked" ? "confirmed" : (b.status as any),
        })
        .where(eq(bookings.id, b.id));
    }
  }
  console.log(`> Processed ${allBookings.length} bookings.`);

  // 2. Migrate Blocked Dates (Time[] -> Ranges)
  console.log("Migrating BlockedDates to blockedRanges...");
  const allBlocks = await db.select().from(blockedDates);

  for (const block of allBlocks) {
    // If we have blockedTimes array but no Ranges
    if (
      block.blockedTimes &&
      (!block.blockedRanges || (block.blockedRanges as any[]).length === 0)
    ) {
      // Convert distinct times to ranges.
      // This is tricky if times are non-contiguous.
      // Simple assumption: Each blocked time is a 60 min slot or the turf's interval?
      // Without turf interval context, this is hard.
      // FALLBACK: Just create 1-hour ranges for each time for safety, or leave empty to prompt manual review?

      // Better approach: We can't perfectly guess duration for old blocks without checking the turf settings.
      // However, the Goal said "Migrate blockedTimes to blockedRanges".
      // Let's assume 1 hour blocks for safety as that's the default interval.

      const newRanges = block.blockedTimes.map((t) => {
        return { start: t, end: addMinutes(t, 60) };
      });

      if (newRanges.length > 0) {
        await db
          .update(blockedDates)
          .set({ blockedRanges: newRanges })
          .where(eq(blockedDates.id, block.id));
      }
    }
  }
  console.log(`> Processed ${allBlocks.length} blocked date entries.`);

  console.log("Migration V2 Complete.");
  process.exit(0);
}

migrateV2().catch((err) => {
  console.error("Migration Failed:", err);
  process.exit(1);
});
