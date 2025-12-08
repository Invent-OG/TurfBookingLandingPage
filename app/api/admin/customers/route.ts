import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { desc, sql, countDistinct, or, ilike } from "drizzle-orm";

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
        ilike(bookings.customerPhone, `%${search}%`)
      );
    }

    // 1. Get Total Unique Customers Count (with filter)
    const totalCountRes = await db
      .select({ count: countDistinct(bookings.customerEmail) })
      .from(bookings)
      .where(whereClause);
    const totalCount = totalCountRes[0]?.count || 0;

    // 2. Get Paginated Aggregated Customers
    const customers = await db
      .select({
        email: bookings.customerEmail,
        name: sql<string>`MAX(${bookings.customerName})`,
        phone: sql<string>`MAX(${bookings.customerPhone})`,
        totalBookings: sql<number>`count(${bookings.id})`,
        lastBooking: sql<string>`MAX(${bookings.date})`,
        totalSpent: sql<number>`SUM(${bookings.totalPrice})`,
      })
      .from(bookings)
      .where(whereClause)
      .groupBy(bookings.customerEmail)
      .orderBy(desc(sql`MAX(${bookings.date})`))
      .limit(safeLimit)
      .offset(offset);

    return NextResponse.json({
      customers,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalCount,
        totalPages: Math.ceil(totalCount / safeLimit) || 1,
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch customers",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
