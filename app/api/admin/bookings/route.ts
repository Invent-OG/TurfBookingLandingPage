import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { bookings } from "@/db/schema";
import { desc, inArray, or, ilike, sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const offset = (page - 1) * limit;

    // Build where clause
    let whereClause = undefined;
    if (search) {
      whereClause = or(
        ilike(bookings.customerName, `%${search}%`),
        ilike(bookings.customerEmail, `%${search}%`),
        ilike(bookings.turfName, `%${search}%`),
        sql`${bookings.id}::text ILIKE ${`%${search}%`}`
      );
    }

    // Get total count for pagination
    const totalCountRes = await db
      .select({ count: sql<number>`count(*)` })
      .from(bookings)
      .where(whereClause);
    const totalCount = Number(totalCountRes[0]?.count || 0);

    // Get paginated data
    const data = await db
      .select()
      .from(bookings)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(bookings.createdAt));

    return NextResponse.json({
      data,
      pagination: {
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid IDs provided" },
        { status: 400 }
      );
    }

    await db.delete(bookings).where(inArray(bookings.id, ids));

    return NextResponse.json({ message: "Bookings deleted successfully" });
  } catch (error) {
    console.error("Error deleting bookings:", error);
    return NextResponse.json(
      { error: "Failed to delete bookings" },
      { status: 500 }
    );
  }
}
