import { blockedDates, bookings } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and, gte, lte, or } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/db";

// ✅ Schema Validation
const BlockedDateSchema = z.object({
  turfId: z.string().uuid(),
  startDate: z.string().nonempty(),
  endDate: z.string().optional(),
  blockedTimes: z.array(z.string()).optional(),
  reason: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const parsedData = BlockedDateSchema.parse(data);
    const { turfId, startDate, endDate, blockedTimes, reason } = parsedData;

    // ✅ Check if there are existing bookings on this date OR in the range
    const effectiveEndDate = endDate || startDate;

    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.turfId, turfId),
          gte(bookings.date, startDate),
          lte(bookings.date, effectiveEndDate),
          or(eq(bookings.status, "confirmed"), eq(bookings.status, "pending")) // Check only valid bookings if needed, but safer to check all generally or at least active ones
          // The previous code didn't check status, so it assumed any booking row is a block.
          // But bookings table has cancelled/rejected. We should probably filter those out ideally.
          // However, to keep it safe and consistent with previous "strict" check, let's just check date range.
          // Wait, previous code was `eq(bookings.date, startDate)`. It didn't filter status.
          // Let's add NOT cancelled/rejected/expired just to be correct?
          // Actually, let's stick to the minimal change: fix the DATE logic.
          // The previous logic didn't filter status, which might be a separat issue/feature.
          // I will assume for now we want to block if ANY booking row exists, OR I should probably look at slots route logic.
          // Slots route filters out cancelled/expired/refunded/rejected.
          // So create route should probably also ignore those.
        )
      );

    // Let's refine the query to match slots/route.ts logic for "valid booking"
    // But `notInArray` is needed.
    // Let's stick to just range check for now to fix the reported bug, and maybe add status check if I can easily import `notInArray`.
    // I need to import `notInArray` too if I want that.

    if (existingBookings.length > 0) {
      return NextResponse.json(
        { message: "Booking already exists for the selected date range." },
        { status: 400 }
      );
    }

    // ✅ Insert Blocked Date using camelCase
    const [insertedBlockedDate] = await db
      .insert(blockedDates)
      .values({
        turfId, // ✅ Use camelCase
        startDate,
        endDate: endDate || null,
        blockedTimes: blockedTimes || null,
        reason,
      })
      .returning();

    return NextResponse.json(
      {
        message: "Blocked date created successfully.",
        data: insertedBlockedDate,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blocked date:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create blocked date.",
      },
      { status: 500 }
    );
  }
}
