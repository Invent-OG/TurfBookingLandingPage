import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { desc, sql, ilike, or, eq, count } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const pageParam = url.searchParams.get("page");
    const limitParam = url.searchParams.get("limit");
    const search = url.searchParams.get("search") || "";

    const page = pageParam ? parseInt(pageParam) : 1;
    const limit = limitParam ? parseInt(limitParam) : 10;

    // Safety check for NaN or invalid numbers
    const safePage = isNaN(page) || page < 1 ? 1 : page;
    const safeLimit = isNaN(limit) || limit < 1 ? 10 : limit;

    const offset = (safePage - 1) * safeLimit;

    let whereClause = undefined;
    if (search) {
      whereClause = or(
        ilike(bookings.customerName, `%${search}%`),
        ilike(bookings.customerEmail, `%${search}%`),
        ilike(bookings.turfName, `%${search}%`)
      );
    }

    // Get Total Count
    const totalCountRes = await db
      .select({ count: count() })
      .from(bookings)
      .where(whereClause);

    const totalCount = totalCountRes[0].count;

    // Get Paginated Data
    const data = await db
      .select()
      .from(bookings)
      .where(whereClause)
      .orderBy(desc(bookings.date), desc(bookings.startTime))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch bookings",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
