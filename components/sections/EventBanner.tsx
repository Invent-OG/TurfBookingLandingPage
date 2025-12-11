import { db } from "@/db/db";
import { events } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { NeonButton } from "@/components/ui/neon-button";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export async function EventBanner() {
  const upcomingEvents = await db
    .select()
    .from(events)
    .where(eq(events.status, "upcoming"))
    .orderBy(desc(events.startDate))
    .limit(1);

  if (!upcomingEvents.length) return null;

  const event = upcomingEvents[0];

  return (
    <div className="relative w-full bg-turf-neon/10 border-b border-turf-neon/20 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent opacity-50"></div>

      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="bg-turf-neon text-black text-xs font-bold px-2 py-1 rounded uppercase tracking-wider animate-pulse">
            Upcoming {event.eventType}
          </span>
          <div className="text-sm md:text-base text-white font-medium flex items-center gap-2">
            <span className="font-bold text-turf-neon">{event.title}</span>
            <span className="hidden md:inline text-gray-400">•</span>
            <span className="text-gray-300 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(event.startDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        <Link href={`/events/${event.id}`}>
          <button className="group flex items-center gap-2 text-sm font-bold text-white hover:text-turf-neon transition-colors">
            View Details{" "}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>
      </div>
    </div>
  );
}
