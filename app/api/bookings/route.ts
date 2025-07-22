// import { db } from "@/db/db";
// import { turfs, users, bookings } from "@/db/schema";
// import { eq, and, or, sql } from "drizzle-orm";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const {
//       userId,
//       turfId,
//       turfName,
//       date,
//       startTime,
//       duration,
//       totalPrice,
//       paymentMethod,
//       customerName,
//       customerPhone,
//       customerEmail,
//     } = body;

//     if (
//       !turfId ||
//       !turfName ||
//       !date ||
//       !startTime ||
//       !duration ||
//       !totalPrice ||
//       !paymentMethod
//     ) {
//       return new Response(
//         JSON.stringify({ error: "Missing required fields" }),
//         { status: 400 }
//       );
//     }

//     // ✅ Fetch Turf Details (Including Closing Time)
//     const turfDetails = await db
//       .select({ closingTime: turfs.closingTime })
//       .from(turfs)
//       .where(eq(turfs.id, turfId));

//     if (!turfDetails.length) {
//       return new Response(JSON.stringify({ error: "Turf not found" }), {
//         status: 404,
//       });
//     }

//     const { closingTime } = turfDetails[0];

//     // ✅ Use Transaction to Ensure Atomicity & Locking
//     return await db.transaction(async (trx) => {
//       const lockKey = hashCode(`${turfId}-${date}-${startTime}`);
//       await trx.execute(sql`SELECT pg_advisory_xact_lock(${lockKey})`);

//       let finalUserId = userId;

//       // ✅ Handle Walk-in Customers (Create User If Not Exists)
//       if (!userId) {
//         if (!customerEmail) {
//           return new Response(
//             JSON.stringify({
//               error: "Customer email is required for walk-ins",
//             }),
//             { status: 400 }
//           );
//         }

//         const existingUser = await trx
//           .select()
//           .from(users)
//           .where(eq(users.email, customerEmail));

//         if (existingUser.length) {
//           finalUserId = existingUser[0].id;
//         } else {
//           const [newUser] = await trx
//             .insert(users)
//             .values({
//               name: customerName,
//               email: customerEmail,
//               password: "walk-in",
//               role: "user",
//             })
//             .returning({ id: users.id });

//           finalUserId = newUser.id;
//         }
//       }

//       // ✅ Convert Start Time & Calculate End Time
//       const endTimeSQL = sql`${startTime} + interval '1 hour' * ${duration}`;

//       // ✅ Check if Booking Exceeds Closing Time
//       const exceedsClosingTime = await trx.execute(
//         sql`SELECT ${endTimeSQL} > ${closingTime} AS exceeds`
//       );
//       const [{ exceeds }] = exceedsClosingTime as unknown as {
//         exceeds: boolean;
//       }[];

//       if (exceeds) {
//         return new Response(
//           JSON.stringify({ error: "Booking exceeds turf closing time" }),
//           { status: 400 }
//         );
//       }

//       // ✅ Check for Overlapping Bookings
//       const conflictingBooking = await trx
//         .select()
//         .from(bookings)
//         .where(
//           and(
//             eq(bookings.turfId, turfId),
//             eq(bookings.date, date),
//             or(
//               // New booking's start time is within an existing booking
//               and(
//                 sql`${startTime} >= ${bookings.startTime}`,
//                 sql`${startTime} < (${bookings.startTime} + interval '1 hour' * ${bookings.duration})`
//               ),
//               // Existing booking's start time is within the new booking duration
//               and(
//                 sql`${bookings.startTime} >= ${startTime}`,
//                 sql`${bookings.startTime} < ${endTimeSQL}`
//               )
//             )
//           )
//         );

//       if (conflictingBooking.length > 0) {
//         console.error("Time slot conflict:", conflictingBooking);
//         throw new Error("Selected time slot is already booked");
//       }

//       // ✅ Insert New Booking
//       const [newBooking] = await trx
//         .insert(bookings)
//         .values({
//           userId: finalUserId,
//           turfId,
//           turfName,
//           date,
//           startTime,
//           duration,
//           totalPrice,
//           paymentMethod,
//           customerName,
//           customerPhone,
//           customerEmail,
//           createdBy: finalUserId,
//           status: "pending",
//         })
//         .returning({ id: bookings.id });

//       return new Response(
//         JSON.stringify({ success: true, bookingId: newBooking.id }),
//         { status: 201 }
//       );
//     });
//   } catch (error) {
//     console.error("Booking Error:", error);
//     return new Response(
//       JSON.stringify({
//         error: error instanceof Error ? error.message : "Internal Server Error",
//       }),
//       { status: 500 }
//     );
//   }
// }

// // ✅ Helper Function for Hashing Lock Key
// function hashCode(str: string): number {
//   let hash = 0;
//   for (let i = 0; i < str.length; i++) {
//     hash = (hash << 5) - hash + str.charCodeAt(i);
//     hash |= 0; // Convert to 32-bit integer
//   }
//   return hash;
// }

import { db } from "@/db/db";
import { turfs, users, bookings } from "@/db/schema";
import { eq, and, or, sql } from "drizzle-orm";

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
      const lockKey = hashCode(`${turfId}-${date}-${startTime}`);
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

      // ✅ Calculate End Time with dynamic slotInterval
      const totalMinutes = duration * slotInterval!;
      const endTimeSQL = sql`(${startTime}::time + make_interval(mins => ${totalMinutes}))`;

      // ✅ Check if booking exceeds turf closing time
      const exceedsClosingTime = await trx.execute(
        sql`SELECT ${endTimeSQL} > ${closingTime} AS exceeds`
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

      // ✅ Check for overlapping bookings using slotInterval
      const conflictingBooking = await trx
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.turfId, turfId),
            eq(bookings.date, date),
            or(
              and(
                sql`${startTime} >= ${bookings.startTime}`,
                sql`${startTime} < (${bookings.startTime} + make_interval(mins => ${slotInterval} * ${bookings.duration}))`
              ),
              and(
                sql`${bookings.startTime} >= ${startTime}`,
                sql`${bookings.startTime} < ${endTimeSQL}`
              )
            )
          )
        );

      if (conflictingBooking.length > 0) {
        console.error("Time slot conflict:", conflictingBooking);
        throw new Error("Selected time slot is already booked");
      }

      // ✅ Insert New Booking
      const [newBooking] = await trx
        .insert(bookings)
        .values({
          userId: finalUserId,
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
          createdBy: finalUserId,
          status: "pending",
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
