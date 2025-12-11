import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings, users } from "@/db/schema";
import { sql, desc, and, gte, inArray } from "drizzle-orm";
import { format, subDays } from "date-fns";

export async function GET() {
  try {
    // 1. Total Revenue
    const revenueResult = await db
      .select({
        value: sql<number>`sum(cast(${bookings.totalPrice} as numeric))`,
      })
      .from(bookings);
    const totalRevenue = revenueResult[0]?.value || 0;

    // 2. Active Bookings Count
    const activeBookingsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(inArray(bookings.status, ["confirmed", "pending"]));
    const activeBookingsCount = activeBookingsResult[0]?.count || 0;

    // 3. Total Customers Count
    const usersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users);
    const totalCustomers = usersResult[0]?.count || 0;

    // 4. Recent Bookings (Top 5)
    // Need customer name and turf name. My bookings schema stores these directly (denormalized or just stored).
    // The previous code fetched bookings.* and used .customer_name.
    // My schema for bookings has `customerName`, `turfName`.
    const recentBookings = await db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt)) // assuming 'createdAt' is better for "Recent" than date of play
      .limit(5);

    // 5. Chart Data (Last 7 Days)
    const sevenDaysAgo = subDays(new Date(), 7); // include today?
    const chartQuery = await db
      .select({
        date: bookings.date,
        dailyRevenue: sql<number>`sum(cast(${bookings.totalPrice} as numeric))`,
        dailyBookings: sql<number>`count(*)`,
      })
      .from(bookings)
      .where(gte(bookings.date, format(sevenDaysAgo, "yyyy-MM-dd"))) // assuming date column is string yyyy-mm-dd
      .groupBy(bookings.date);

    // Prepare chart data map
    const chartMap = new Map();
    chartQuery.forEach((item) => {
      chartMap.set(item.date, {
        revenue: Number(item.dailyRevenue),
        bookings: Number(item.dailyBookings),
      });
    });

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const dateStr = format(d, "yyyy-MM-dd");
      const stat = chartMap.get(dateStr) || { revenue: 0, bookings: 0 };
      return {
        date: d,
        name: format(d, "EEE"),
        revenue: stat.revenue,
        bookings: stat.bookings,
      };
    });

    return NextResponse.json({
      stats: {
        totalRevenue,
        activeBookings: activeBookingsCount,
        totalCustomers,
      },
      recentBookings,
      chartData,
    });
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
