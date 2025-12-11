import { db } from "@/db/db";
import { events } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, id))
      .limit(1);

    if (!event.length) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(event[0]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error fetching event:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal Server Error",
        stack: error.stack,
      }),
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const [updatedEvent] = await db
      .update(events)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvent) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(updatedEvent), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db
      .delete(events)
      .where(eq(events.id, id))
      .returning({ id: events.id });

    if (!deleted.length) {
      return new Response(JSON.stringify({ error: "Event not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
