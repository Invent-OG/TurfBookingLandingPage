"use client";

import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Calendar, Users, Ticket, ArrowRight, Trophy } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface Event {
  id: string;
  title: string;
  status: string;
  startDate: string;
  eventType: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  bannerImage: string;
}

export const HomeEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events?status=upcoming");
        if (res.ok) {
          const data = await res.json();
          // Take top 3
          setEvents(data.slice(0, 3));
        }
      } catch (error) {
        console.error("Failed to load events", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (!loading && events.length === 0) return null;

  return (
    <section className="relative py-20 bg-turf-dark overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <Badge
            variant="outline"
            className="border-turf-neon text-turf-neon mb-2"
          >
            <Trophy className="w-3 h-3 mr-2" /> Tournaments & Leagues
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-white font-heading tracking-tight">
            Upcoming <span className="text-turf-neon">Events</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Compete in our exclusive tournaments and leagues.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-turf-neon"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <GlassCard className="h-full flex flex-col p-0 overflow-hidden hover:border-turf-neon/50 transition-all duration-300 group cursor-pointer hover:-translate-y-1">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={
                          event.bannerImage ||
                          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-turf-neon text-turf-dark font-bold hover:bg-turf-neon">
                          {event.eventType}
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-turf-neon transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-300 mt-1">
                          <Calendar className="w-3 h-3 text-turf-neon" />
                          <span>
                            {format(new Date(event.startDate), "MMM d, yyyy")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/events">
            <NeonButton variant="ghost" className="px-8">
              View All Events <ArrowRight className="w-4 h-4 ml-2" />
            </NeonButton>
          </Link>
        </div>
      </div>
    </section>
  );
};
