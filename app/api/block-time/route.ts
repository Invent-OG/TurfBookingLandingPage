import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { blockedDates } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

    // Fetch existing blocked times
    const existingRecord = await db
      .select({ blockedTimes: blockedDates.blockedTimes })
      .from(blockedDates)
      .where(
        and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
      )
      .limit(1);

    let updatedBlockedTimes = blockedTimes;

    if (existingRecord.length) {
      const existingBlockedTimes = existingRecord[0]?.blockedTimes || [];
      updatedBlockedTimes = Array.from(
        new Set([...existingBlockedTimes, ...blockedTimes])
      ); // Merge and remove duplicates
    }

    await db
      .insert(blockedDates)
      .values({
        turfId,
        startDate: date,
        blockedTimes: updatedBlockedTimes,
        createdAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [blockedDates.turfId, blockedDates.startDate],
        set: { blockedTimes: updatedBlockedTimes },
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
      .select({ blockedTimes: blockedDates.blockedTimes })
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

    const updatedBlockedTimes = existingRecord[0].blockedTimes.filter(
      (t) => t !== time
    );

    if (updatedBlockedTimes.length > 0) {
      // Update if some blocked times remain
      await db
        .update(blockedDates)
        .set({ blockedTimes: updatedBlockedTimes })
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
