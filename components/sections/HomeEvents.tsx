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
    <section className="relative py-20 overflow-hidden">
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
                  <div className="h-full group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-turf-neon hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] transition-all duration-300">
                    {/* Image Section */}
                    <div className="relative h-56 w-full overflow-hidden">
                      <div className="absolute inset-0 bg-turf-neon/20 mix-blend-overlay z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <img
                        src={
                          event.bannerImage ||
                          "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
                        }
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-transform duration-700"
                      />

                      {/* Sporty Skewed Badge */}
                      <div className="absolute top-4 right-[-10px] z-20 transform skew-x-[-15deg]">
                        <div className="bg-turf-neon text-black font-black text-xs uppercase px-6 py-1.5 shadow-lg border-l-4 border-black">
                          {event.eventType}
                        </div>
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 relative">
                      {/* Decorative Line */}
                      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-turf-neon/50 to-transparent"></div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-turf-neon font-mono text-xs font-bold uppercase tracking-wider bg-turf-neon/10 px-2 py-1 rounded">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(event.startDate), "MMM d, yyyy")}
                        </div>
                      </div>

                      <h3 className="text-2xl font-black text-white font-heading italic uppercase leading-none mb-4 group-hover:text-turf-neon transition-colors">
                        {event.title}
                      </h3>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                        <div className="text-gray-400 text-sm font-medium flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-turf-neon animate-pulse"></span>
                          {event.status}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-turf-neon group-hover:translate-x-2 transition-all" />
                      </div>
                    </div>
                  </div>
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
