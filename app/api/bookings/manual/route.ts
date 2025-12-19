import { db } from "@/db/db";
import { sendEmail } from "@/lib/email-service";
import { turfs, users, bookings, blockedDates } from "@/db/schema";
import { eq, and, or, sql, notInArray } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("🟢 Received Manual Booking Payload:", body);

    const {
      userId,
      turfId,
      turf_name,
      date,
      startTime,
      duration,
      totalPrice,
      status = "confirmed",
      paymentMethod,
      customerName,
      customerPhone,
      customerEmail,
      createdBy,
    } = body;

    // Basic Validation
    if (
      !turfId ||
      !turf_name ||
      !date ||
      !startTime ||
      !customerName ||
      !customerPhone
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Ensure numeric types
    const parsedDuration = Number(duration);
    const parsedTotalPrice = Number(totalPrice);
    if (isNaN(parsedDuration) || isNaN(parsedTotalPrice)) {
      return new Response(
        JSON.stringify({ error: "Invalid duration or price" }),
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
      // ✅ Lock for consistency
      const lockKey = hashCode(`${turfId}-${date}`);
      await trx.execute(sql`SELECT pg_advisory_xact_lock(${lockKey})`);

      let finalUserId = userId;

      // Handle Walk-in User Creation
      if (!userId && customerEmail) {
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
              password: "walk-in-manual",
              role: "user",
            })
            .returning({ id: users.id });
          finalUserId = newUser.id;
        }
      }

      // Calculate End Time
      // Ensure we treat duration as HOURS.
      // The slotInterval might be 60, but if it changes, manual booking "duration" input is usually "Hours".
      // Let's standardise on Duration Input = Hours.
      const totalMinutes = parsedDuration * 60;

      // Calculate endTime string manually to ensure DB gets it
      const [startHours, startMinutes] = startTime.split(":").map(Number);
      const endTotalMinutes = startHours * 60 + startMinutes + totalMinutes;
      const endHours = Math.floor(endTotalMinutes / 60);
      const endMinutesResult = endTotalMinutes % 60;
      // Handle day rollover if needed, but for now simple format (24h)
      // If > 24, it might break time column? DB `time` type usually handles 24h.
      // If it exceeds 24h, PG time type might wrap or error depending on implementation.
      // Assuming single day operation for now or valid 24h time.
      const formattedEndTime = `${String(endHours).padStart(2, "0")}:${String(endMinutesResult).padStart(2, "0")}:00`;

      const endTimeSQL = sql`(${startTime}::time + make_interval(mins => ${totalMinutes}))`;

      // Check Closing Time limits (Optional for manual override, but safer to enforce)
      // Admins might want to overbook, but let's enforce closing time for now or log warning
      const exceedsClosingTime = await trx.execute(
        sql`SELECT ${endTimeSQL} > ${closingTime} AS exceeds`
      );
      if ((exceedsClosingTime as any)[0].exceeds) {
        return new Response(JSON.stringify({ error: "Exceeds closing time" }), {
          status: 400,
        });
      }

      // ✅ Check for overlapping bookings (excluding cancelled)
      // Admins might want to force book, but we should default to preventing errors
      const conflictingBooking = await trx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.turfId, turfId),
            eq(bookings.date, date),
            notInArray(bookings.status, ["cancelled", "rejected"]),
            or(
              and(
                sql`${startTime} >= ${bookings.startTime}`,
                sql`${startTime} < (${bookings.startTime} + make_interval(mins => ${bookings.duration} * 60))` // Ensure duration is treated as hours here too effectively
              ),
              and(
                sql`${bookings.startTime} >= ${startTime}`,
                sql`${bookings.startTime} < ${endTimeSQL}`
              )
            )
          )
        );

      if (conflictingBooking.length > 0) {
        return new Response(JSON.stringify({ error: "Slot already booked" }), {
          status: 409,
        });
      }

      // ✅ Insert Manual Booking
      const [newBooking] = await trx
        .insert(bookings)
        .values({
          userId: finalUserId || null, // Allow null if no email provided for walk-in (though schema might want UUID, checked earlier)
          turfId,
          turfName: turf_name,
          date,
          startTime,
          endTime: formattedEndTime, // ✅ Added endTime
          duration: parsedDuration,
          totalPrice: parsedTotalPrice.toString(),
          paymentMethod,
          customerName,
          customerPhone,
          customerEmail,
          createdBy: createdBy, // Admin ID
          status: status,
        })
        .returning({ id: bookings.id });

      // Send Email Background Task
      if (customerEmail) {
        console.log(
          `📌 [ManualBookingRoute] Triggering email for ${customerEmail}`
        );
        try {
          await sendEmail({
            to: customerEmail,
            type: "booking_confirmation",
            data: {
              email: customerEmail,
              name: customerName,
              bookingId: newBooking.id,
              date: date,
              time: startTime,
              duration: parsedDuration,
              amount: String(parsedTotalPrice),
              turf: turf_name,
              phone: customerPhone,
            },
          });
          console.log(
            `✅ [ManualBookingRoute] Email sent successfully to ${customerEmail}`
          );
        } catch (emailError) {
          console.error(
            `❌ [ManualBookingRoute] Failed to send email:`,
            emailError
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, booking: newBooking }),
        { status: 201 }
      );
    });
  } catch (error) {
    console.error("Manual Booking Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}

// Helper
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
