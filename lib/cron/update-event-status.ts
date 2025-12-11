import { db } from "@/db/db";
import { events } from "@/db/schema";
import { and, lt, lte, gt, ne, eq } from "drizzle-orm";

export async function updateEventStatuses() {
  const now = new Date().toISOString();

  // 1. Mark 'upcoming' events as 'active' if startDate <= now
  // We only check events that are NOT already active/completed/cancelled to avoid redundant updates
  // Actually, easiest logic is:
  // If status is 'upcoming' AND startDate <= now -> 'active'
  await db
    .update(events)
    .set({ status: "active" })
    .where(and(eq(events.status, "upcoming"), lte(events.startDate, now)));

  // 2. Mark 'active' events as 'completed' if endDate < now
  await db
    .update(events)
    .set({ status: "completed" })
    .where(and(eq(events.status, "active"), lt(events.endDate, now)));

  // 3. Mark 'upcoming' events as 'completed' if endDate < now (Edge case: short event passed without being active)
  await db
    .update(events)
    .set({ status: "completed" })
    .where(and(eq(events.status, "upcoming"), lt(events.endDate, now)));
}
