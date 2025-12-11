import { db } from "@/db/db";
import { events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      turfId,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      registrationType,
      maxParticipants,
      price,
      prizeDetails,
      rules,
      bannerImage,
      createdBy,
    } = body;

    // Basic validation
    if (
      !title ||
      !turfId ||
      !eventType ||
      !startDate ||
      !endDate ||
      !registrationType ||
      !maxParticipants ||
      !price
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 }
      );
    }

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        description,
        turfId,
        eventType,
        startDate,
        endDate,
        startTime,
        endTime,
        registrationType,
        maxParticipants,
        currentParticipants: 0,
        price,
        prizeDetails,
        rules,
        bannerImage,
        status: "upcoming", // Auto-set to upcoming initially
        createdBy,
      })
      .returning();

    return new Response(JSON.stringify(newEvent), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}

import { updateEventStatuses } from "@/lib/cron/update-event-status";
import { like, ilike, and } from "drizzle-orm"; // Added and, ilike

export async function GET(req: Request) {
  try {
    // 1. Trigger Status Update lazy check
    await updateEventStatuses();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const turfId = searchParams.get("turfId");
    const eventType = searchParams.get("eventType");
    const title = searchParams.get("title");

    let query = db.select().from(events).orderBy(desc(events.startDate));

    // Dynamic Filtering
    const filters = [];

    if (status && status !== "all") {
      // Cast status to any to bypass strict literal type check for "upcoming" | "active" etc.
      // In a real app we'd validate against the enum.
      filters.push(eq(events.status, status as any));
    }
    if (turfId) {
      filters.push(eq(events.turfId, turfId));
    }
    if (eventType && eventType !== "all") {
      filters.push(eq(events.eventType, eventType));
    }
    if (title) {
      // Using 'ilike' for case-insensitive search if supported by DB driver, or 'like' normally.
      // Drizzle 'ilike' is standard for PG.
      filters.push(ilike(events.title, `%${title}%`));
    }

    // Apply all filters
    if (filters.length > 0) {
      // @ts-ignore - Drizzle specific referencing
      query = query.where(and(...filters));
    }

    const allEvents = await query;

    return new Response(JSON.stringify(allEvents), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal Server Error",
      }),
      { status: 500 }
    );
  }
}
