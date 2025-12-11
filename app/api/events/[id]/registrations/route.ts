import { db } from "@/db/db";
import { eventRegistrations, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const registrations = await db
      .select({
        id: eventRegistrations.id,
        teamName: eventRegistrations.teamName,
        members: eventRegistrations.members,
        paymentStatus: eventRegistrations.paymentStatus,
        customerPhone: eventRegistrations.customerPhone, // Include phone
        registeredAt: eventRegistrations.registeredAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(eventRegistrations)
      .leftJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, id))
      .orderBy(desc(eventRegistrations.registeredAt));

    return new Response(JSON.stringify(registrations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching registrations:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
