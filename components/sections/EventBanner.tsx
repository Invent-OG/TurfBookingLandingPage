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
    <div className="relative w-full bg-black/80 backdrop-blur-md border-b border-turf-neon/30 overflow-hidden z-[60]">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-turf-neon to-transparent opacity-70"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <span className="bg-turf-neon text-black text-[10px] sm:text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest shadow-[0_0_10px_rgba(204,255,0,0.4)] animate-pulse">
            Upcoming {event.eventType}
          </span>
          <div className="text-sm text-white/90 font-medium flex items-center gap-2">
            <span className="font-bold text-turf-neon tracking-wide">
              {event.title}
            </span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30"></span>
            <span className="text-gray-300 flex items-center gap-1.5 opacity-80 text-xs sm:text-sm">
              <Calendar className="w-3.5 h-3.5 text-turf-neon/80" />
              {format(new Date(event.startDate), "MMMM d, yyyy")}
            </span>
            <span className="hidden sm:inline w-1 h-1 rounded-full bg-white/30"></span>
            <span className="text-gray-300 flex items-center gap-1.5 opacity-80 text-xs sm:text-sm">
              Starts at{" "}
              {format(new Date(`2000-01-01T${event.startTime}`), "h:mm a")}
            </span>
          </div>
        </div>

        <Link href={`/events/${event.id}`}>
          <button className="group flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-turf-neon transition-all duration-300 border border-white/10 hover:border-turf-neon/50 bg-white/5 hover:bg-turf-neon/10 px-4 py-1.5 rounded-full">
            View Details{" "}
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-turf-neon" />
          </button>
        </Link>
      </div>
    </div>
  );
}
