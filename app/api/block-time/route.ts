import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { blockedDates, turfs } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Helper to add minutes
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:00`;
}

// POST - Block time slots
export async function POST(req: Request) {
  try {
    const {
      turfId,
      date,
      blockedTimes,
    }: { turfId: string; date: string; blockedTimes: string[] } =
      await req.json();

    if (!turfId || !date || !blockedTimes?.length) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Fetch Turf details for slot interval
    const turf = await db
      .select({ slotInterval: turfs.slotInterval })
      .from(turfs)
      .where(eq(turfs.id, turfId))
      .limit(1);
    if (!turf.length) {
      return NextResponse.json({ error: "Turf not found" }, { status: 404 });
    }
    const slotInterval = turf[0].slotInterval || 60;

    // Fetch existing blocked times
    const existingRecord = await db
      .select({
        blockedTimes: blockedDates.blockedTimes,
        blockedRanges: blockedDates.blockedRanges,
      })
      .from(blockedDates)
      .where(
        and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
      )
      .limit(1);

    let updatedBlockedTimes = blockedTimes;
    let updatedBlockedRanges: { start: string; end: string }[] = [];

    // Calculate ranges for new blocked times
    const newRanges = blockedTimes.map((t) => ({
      start: t,
      end: addMinutes(t, slotInterval),
    }));

    if (existingRecord.length) {
      const existingBlockedTimes = existingRecord[0]?.blockedTimes || [];
      updatedBlockedTimes = Array.from(
        new Set([...existingBlockedTimes, ...blockedTimes])
      ); // Merge and remove duplicates

      const existingRanges =
        (existingRecord[0]?.blockedRanges as {
          start: string;
          end: string;
        }[]) || [];
      // Merge ranges? Simple append for now? Or dedupe?
      // Since ranges depend on start time, let's filter based on start time equality?
      // Or just rebuild ranges from `updatedBlockedTimes`?
      // Rebuilding from `updatedBlockedTimes` ensures consistency IF slotInterval is constant.
      // If slotInterval changed, rebuilding might invalidate old custom ranges?
      // Assuming slotInterval is constant per turf.
      // Safer: Rebuild ranges from ALL blocked times to ensure consistency.
      updatedBlockedRanges = updatedBlockedTimes.map((t) => ({
        start: t,
        end: addMinutes(t, slotInterval),
      }));
    } else {
      updatedBlockedRanges = newRanges;
    }

    await db
      .insert(blockedDates)
      .values({
        turfId,
        startDate: date,
        blockedTimes: updatedBlockedTimes,
        blockedRanges: updatedBlockedRanges,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [blockedDates.turfId, blockedDates.startDate],
        set: {
          blockedTimes: updatedBlockedTimes,
          blockedRanges: updatedBlockedRanges,
        },
      });

    return NextResponse.json(
      { message: "Blocked times updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error blocking times:", error);
    return NextResponse.json(
      { error: "Failed to update blocked times" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const turfId = url.searchParams.get("turfId");
    const date = url.searchParams.get("date");

    if (!turfId || !date) {
      return NextResponse.json(
        { error: "Missing turfId or date" },
        { status: 400 }
      );
    }

    const blockedTimeData = await db
      .select()
      .from(blockedDates)
      .where(
        and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
      );

    const allBlockedTimes = blockedTimeData.flatMap(
      (record) => record.blockedTimes || []
    );

    return NextResponse.json(
      { blockedTimes: allBlockedTimes },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error fetching blocked times:", error);
    return NextResponse.json(
      { error: "Failed to fetch blocked times" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const {
      turfId,
      date,
      time,
    }: { turfId: string; date: string; time: string } = await req.json();

    if (!turfId || !date || !time) {
      return NextResponse.json(
        { error: "Missing turfId, date, or time" },
        { status: 400 }
      );
    }

    // Fetch existing blocked times
    const existingRecord = await db
      .select({
        blockedTimes: blockedDates.blockedTimes,
        blockedRanges: blockedDates.blockedRanges,
      })
      .from(blockedDates)
      .where(
        and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
      )
      .limit(1);

    if (!existingRecord.length || !existingRecord[0]?.blockedTimes?.length) {
      return NextResponse.json(
        { error: "No blocked times found" },
        { status: 404 }
      );
    }

    // Update blockedTimes
    const updatedBlockedTimes = existingRecord[0].blockedTimes.filter(
      (t) => t !== time
    );

    // Update blockedRanges (remove range starting at `time`)
    const existingRanges =
      (existingRecord[0].blockedRanges as { start: string; end: string }[]) ||
      [];
    const updatedBlockedRanges = existingRanges.filter((r) => r.start !== time);

    if (updatedBlockedTimes.length > 0) {
      // Update if some blocked times remain
      await db
        .update(blockedDates)
        .set({
          blockedTimes: updatedBlockedTimes,
          blockedRanges: updatedBlockedRanges,
        })
        .where(
          and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
        );
    } else {
      // Delete if no blocked times remain
      await db
        .delete(blockedDates)
        .where(
          and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
        );
    }

    return NextResponse.json(
      { message: "Blocked time removed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("❌ Error deleting blocked time:", error);
    return NextResponse.json(
      { error: "Failed to delete blocked time" },
      { status: 500 }
    );
  }
}
