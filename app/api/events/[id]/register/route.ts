import { db } from "@/db/db";
import { sendEmail } from "@/lib/email-service";
import { events, eventRegistrations, users } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const eventId = params.id;
    const body = await req.json();
    const {
      userId,
      teamName,
      members,
      customerEmail,
      customerName,
      customerPhone,
    } = body;

    if (!eventId) {
      return new Response(JSON.stringify({ error: "Event ID required" }), {
        status: 400,
      });
    }

    // Transaction to ensure atomicity
    const result = await db.transaction(async (trx) => {
      // 1. Fetch Event & Check Status/Capacity
      const event = await trx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return null; // Return null if not found, to check outside (or throw error inside)
        // Actually, cleaner to check inside, but since we need to return Response,
        // we previously returned Response inside transaction.
        // Drizzle transaction returns what the callback returns.
        // But we are mixing returning Response vs returning Object.
        // Let's stick to checking logic inside but throwing error to break transaction if needed
        // OR simply handle the 'error' case by returning a special object.
      }

      const eventDetails = event[0];

      // We can re-check validity and throw specific errors to be caught by catch block
      if (
        eventDetails.status !== "upcoming" &&
        eventDetails.status !== "active"
      ) {
        throw new Error("Event is not open for registration");
      }
      if (eventDetails.currentParticipants >= eventDetails.maxParticipants) {
        throw new Error("Event is fully booked");
      }

      // ... User Handling (logic remains same, assume finalUserId is derived same way or re-implement)
      // Since we need to access 'userId' from outer scope or re-run logic.
      // The original code had the logic INSIDE transaction.
      // I will keep logic inside but need to return the object ONLY on success,
      // otherwise if I return Response from inside, 'result' will be a Response object.

      // Let's refactor slightly to be safer:
      // If we return Response from transaction, we can't use 'result.registration'.
      // We should return a discriminated union or just throw errors for failure cases.

      // 2. Handle User
      let finalUserId = userId;
      if (!userId) {
        if (!customerEmail || !customerName) {
          throw new Error("User details required");
        }
        // Check user inside transaction
        const existingUser = await trx
          .select()
          .from(users)
          .where(eq(users.email, customerEmail))
          .limit(1);
        if (existingUser.length) {
          finalUserId = existingUser[0].id;
        } else {
          const [newUser] = await trx
            .insert(users)
            .values({
              name: customerName,
              email: customerEmail,
              password: "event-guest",
              role: "user",
            })
            .returning({ id: users.id });
          finalUserId = newUser.id;
        }
      }

      // 3. Check existing
      const existingRegistration = await trx
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, eventId),
            eq(eventRegistrations.userId, finalUserId)
          )
        )
        .limit(1);

      if (existingRegistration.length) {
        throw new Error("User already registered for this event");
      }

      // 4. Create Registration
      const [newRegistration] = await trx
        .insert(eventRegistrations)
        .values({
          eventId,
          userId: finalUserId,
          teamName: teamName || null,
          members: members || null,
          customerPhone: customerPhone || null,
          paymentStatus: "pending",
        })
        .returning();

      // 5. Update Count
      await trx
        .update(events)
        .set({
          currentParticipants: sql`${events.currentParticipants} + 1`,
        })
        .where(eq(events.id, eventId));

      return {
        registration: newRegistration,
        eventTitle: eventDetails.title,
        eventDate: eventDetails.startDate,
        amount: eventDetails.price,
      };
    });

    if (!result) {
      // Should have been caught by "Event not found" check inside or if we used null return
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    // 6. Send Email Notification
    // Ensure eventDate is treated as string. Drizzle 'date' is usually string.
    // 6. Send Email Notification
    console.log(
      `📌 [EventRegisterRoute] Sending registration email to ${customerEmail}`
    );
    try {
      await sendEmail({
        to: customerEmail,
        type: "event_registration",
        data: {
          email: customerEmail,
          name: customerName,
          eventName: result.eventTitle,
          eventDate: String(result.eventDate),
          teamName: teamName,
          amount: result.amount,
          registrationId: result.registration.id,
        },
      });
      console.log(
        `✅ [EventRegisterRoute] Event registration email sent successfully.`
      );
    } catch (emailError) {
      console.error(
        "❌ [EventRegisterRoute] Failed to send event registration email:",
        emailError
      );
    }

    return new Response(
      JSON.stringify({ success: true, registration: result.registration }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error registering for event:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
