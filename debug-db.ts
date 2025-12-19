import { db } from "@/db/db";
import { turfs, blockedDates, bookings } from "@/db/schema";
import { eq, or, and, gte, lte } from "drizzle-orm";

async function check() {
  // 1. Find Turf
  const allTurfs = await db
    .select({ id: turfs.id, name: turfs.name })
    .from(turfs);
  const targetTurf = allTurfs.find((t) => t.name.toLowerCase().includes("krp"));

  if (!targetTurf) {
    console.log(
      "Turf not found. Available:",
      allTurfs.map((t) => t.name)
    );
    return;
  }

  console.log("Found Turf:", targetTurf);

  const turfId = targetTurf.id;
  const targetDate = "2025-12-23";

  // 2. Check Blocked Dates overlapping Dec 23
  // logic: startDate <= 23 AND (endDate is null OR endDate >= 23)
  // OR just dump all blocked dates around that time
  const blocks = await db
    .select()
    .from(blockedDates)
    .where(eq(blockedDates.turfId, turfId));
  console.log("\n--- BLOCKED DATES ---");
  blocks.forEach((b) => {
    console.log(
      `ID: ${b.id}, Start: ${b.startDate}, End: ${b.endDate}, Ranges: ${JSON.stringify(b.blockedRanges)}, Times: ${JSON.stringify(b.blockedTimes)}`
    );
    // Check overlap manually
    const s = b.startDate;
    const e = b.endDate || b.startDate; // Single day defaults to self
    if (s <= targetDate && e >= targetDate) {
      console.log(`>>> OVERLAP DETECTED with ${targetDate} <<<`);
    }
  });

  // 3. Check Bookings on Dec 23
  const books = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.turfId, turfId), eq(bookings.date, targetDate)));
  console.log("\n--- BOOKINGS ON 2025-12-23 ---");
  books.forEach((b) => {
    console.log(
      `ID: ${b.id}, Status: ${b.status}, Start: ${b.startTime}, End: ${b.endTime}`
    );
  });
}

check()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
