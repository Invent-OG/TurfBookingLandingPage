import { db } from "@/db/db";
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
    return await db.transaction(async (trx) => {
      // 1. Fetch Event & Check Status/Capacity
      const event = await trx
        .select()
        .from(events)
        .where(eq(events.id, eventId))
        .limit(1);

      if (!event.length) {
        return new Response(JSON.stringify({ error: "Event not found" }), {
          status: 404,
        });
      }

      const eventDetails = event[0];

      if (
        eventDetails.status !== "upcoming" &&
        eventDetails.status !== "active"
      ) {
        return new Response(
          JSON.stringify({ error: "Event is not open for registration" }),
          {
            status: 400,
          }
        );
      }

      if (eventDetails.currentParticipants >= eventDetails.maxParticipants) {
        return new Response(
          JSON.stringify({ error: "Event is fully booked" }),
          { status: 400 }
        );
      }

      // 2. Handle User (Create if walk-in/new)
      let finalUserId = userId;
      if (!userId) {
        if (!customerEmail || !customerName) {
          return new Response(
            JSON.stringify({ error: "User details required" }),
            { status: 400 }
          );
        }
        // Check if user exists by email
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
              password: "event-guest", // Placeholder
              role: "user",
            })
            .returning({ id: users.id });
          finalUserId = newUser.id;
        }
      }

      // 3. Check if already registered
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
        return new Response(
          JSON.stringify({ error: "User already registered for this event" }),
          {
            status: 400,
          }
        );
      }

      // 4. Create Registration
      const [newRegistration] = await trx
        .insert(eventRegistrations)
        .values({
          eventId,
          userId: finalUserId,
          teamName: teamName || null,
          members: members || null,
          customerPhone: customerPhone || null, // Save phone
          paymentStatus: "pending", // Default to pending, update after payment
        })
        .returning();

      // 5. Update Event Participant Count
      await trx
        .update(events)
        .set({
          currentParticipants: sql`${events.currentParticipants} + 1`,
        })
        .where(eq(events.id, eventId));

      return {
        registration: newRegistration,
        eventTitle: eventDetails.title,
        eventDate: eventDetails.date,
        amount: eventDetails.price,
      };
    });

    // 6. Send Email Notification (Outside transaction to avoid blocking/rollback issues)
    if (result && result.registration) {
      fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/send-email`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event_registration",
            email: customerEmail,
            name: customerName,
            eventName: result.eventTitle,
            eventDate: result.eventDate.toISOString().split("T")[0],
            teamName: teamName,
            amount: result.amount,
            registrationId: result.registration.id,
          }),
        }
      ).catch((err) =>
        console.error("Failed to send event registration email:", err)
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
