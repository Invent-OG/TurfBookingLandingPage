import { db } from "@/db/db";
import { turfs, users, bookings, blockedDates } from "@/db/schema";
import { eq, and, or, sql, notInArray, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const turfId = url.searchParams.get("turfId");

    if (!turfId) {
      return new Response(
        JSON.stringify({ error: "Missing turfId parameter" }),
        {
          status: 400,
        }
      );
    }

    const data = await db
      .select({
        id: bookings.id,
        date: bookings.date,
        startTime: bookings.startTime,
        duration: bookings.duration,
        status: bookings.status,
      })
      .from(bookings)
      .where(eq(bookings.turfId, turfId))
      .orderBy(desc(bookings.date));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch bookings" }), {
      status: 500,
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      userId,
      turfId,
      turfName,
      date,
      startTime,
      duration,
      totalPrice,
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
    } = body;

    if (
      !turfId ||
      !turfName ||
      !date ||
      !startTime ||
      !duration ||
      !totalPrice ||
      !paymentMethod
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // ✅ Fetch Turf Details (Including Closing Time & Slot Interval)
    const turfDetails = await db
      .select({
        closingTime: turfs.closingTime,
        slotInterval: turfs.slotInterval,
      })
      .from(turfs)
      .where(eq(turfs.id, turfId));

    if (!turfDetails.length) {
      return new Response(JSON.stringify({ error: "Turf not found" }), {
        status: 404,
      });
    }

    const { closingTime, slotInterval } = turfDetails[0];

    return await db.transaction(async (trx) => {
      // ✅ Lock for the specific Turf + Date to prevent ANY overlap race conditions
      const lockKey = hashCode(`${turfId}-${date}`);
      await trx.execute(sql`SELECT pg_advisory_xact_lock(${lockKey})`);

      let finalUserId = userId;

      // ✅ Handle Walk-in Customers (Create User If Not Exists)
      if (!userId) {
        if (!customerEmail) {
          return new Response(
            JSON.stringify({
              error: "Customer email is required for walk-ins",
            }),
            { status: 400 }
          );
        }

        const existingUser = await trx
          .select()
          .from(users)
          .where(eq(users.email, customerEmail));

        if (existingUser.length) {
          finalUserId = existingUser[0].id;
        } else {
          const [newUser] = await trx
            .insert(users)
            .values({
              name: customerName,
              email: customerEmail,
              password: "walk-in",
              role: "user",
            })
            .returning({ id: users.id });

          finalUserId = newUser.id;
        }
      }

      // ✅ Calculate End Time in JS first (needed for blocked ranges check)
      const endTimeStr = addMinutes(startTime, duration * slotInterval!);
      // Calculate End Time SQL for conflict query
      // const endTimeSQL = ... (we can use endTimeStr string casting to time now)

      // ✅ Check if booking exceeds turf closing time
      // using endTimeStr
      const exceedsClosingTime = await trx.execute(
        sql`SELECT ${endTimeStr}::time > ${closingTime} AS exceeds`
      );
      const [{ exceeds }] = exceedsClosingTime as unknown as {
        exceeds: boolean;
      }[];

      if (exceeds) {
        return new Response(
          JSON.stringify({ error: "Booking exceeds turf closing time" }),
          { status: 400 }
        );
      }

      // ✅ Check for Blocked Dates/Times/Ranges
      const blockedEntries = await trx
        .select()
        .from(blockedDates)
        .where(
          and(eq(blockedDates.turfId, turfId), eq(blockedDates.startDate, date))
        );

      for (const entry of blockedEntries) {
        // Full day block (if no specific times/ranges defined)
        if (
          (!entry.blockedTimes || entry.blockedTimes.length === 0) &&
          (!entry.blockedRanges || (entry.blockedRanges as any[]).length === 0)
        ) {
          throw new Error("Selected date is fully blocked.");
        }

        // Slot block check (Legacy)
        if (entry.blockedTimes && entry.blockedTimes.includes(startTime)) {
          throw new Error("Selected time slot is blocked.");
        }

        // Range block check
        if (entry.blockedRanges) {
          const ranges = entry.blockedRanges as {
            start: string;
            end: string;
          }[];
          const startMinutes = timeToMinutes(startTime);
          const endMinutes = timeToMinutes(endTimeStr);

          for (const r of ranges) {
            const rStart = timeToMinutes(r.start);
            const rEnd = timeToMinutes(r.end);
            // Overlap check
            if (startMinutes < rEnd && endMinutes > rStart) {
              throw new Error(
                "Selected time slot overlaps with a blocked range."
              );
            }
          }
        }
      }

      // ✅ Check for overlapping bookings
      // Logic: Overlap if (StartA < EndB) and (EndA > StartB)
      // Status Check:
      // - Confirmed: ALWAYS blocks.
      // - Blocked: ALWAYS blocks.
      // - Pending: Blocks ONLY if lockedUntil > NOW().

      const conflictingBooking = await trx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.turfId, turfId),
            eq(bookings.date, date),
            // Exclude explicitly cancelled/expired/refunded/rejected
            notInArray(bookings.status, [
              "cancelled",
              "expired",
              "refunded",
              "rejected",
            ]),
            // Time Overlap
            or(
              and(
                sql`${bookings.startTime} < ${endTimeStr}::time`,
                sql`${bookings.endTime} > ${startTime}::time`
              )
            ),
            // Status/Lock Validity Check
            or(
              // If confirmed/blocked, it's a conflict
              notInArray(bookings.status, ["pending"]),
              // If pending, it's a conflict ONLY if still locked
              and(
                eq(bookings.status, "pending"),
                sql`${bookings.lockedUntil} > NOW()`
              )
            )
          )
        );

      if (conflictingBooking.length > 0) {
        console.error("Time slot conflict:", conflictingBooking);
        throw new Error("Selected time slot is already booked or locked");
      }

      // ✅ Insert New Booking with Lock
      const [newBooking] = await trx
        .insert(bookings)
        .values({
          userId: finalUserId,
          turfId,
          turfName,
          date,
          startTime,
          endTime: endTimeStr, // Explicitly save endTime
          duration,
          totalPrice,
          priceBreakup: body.priceBreakup || null, // Persist breakup
          paymentMethod,
          customerName,
          customerPhone,
          customerEmail,
          createdBy: finalUserId,
          status: "pending",
          lockedUntil: new Date(Date.now() + 10 * 60 * 1000), // Lock for 10 mins
        })
        .returning({ id: bookings.id });

      return new Response(
        JSON.stringify({ success: true, bookingId: newBooking.id }),
        { status: 201 }
      );
    });
  } catch (error) {
    console.error("Booking Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}

// ✅ Helper: Generate advisory lock key
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// ✅ Helper to add minutes to a time string "HH:mm:ss"
function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}:00`;
}

// ✅ Helper to convert time string to minutes
function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}
