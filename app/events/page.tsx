"use client";

import React, { useEffect, useState, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  status: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  price: number;
  maxParticipants: number;
  currentParticipants: number;
  bannerImage: string;
  eventType: string;
  turfId: string;
}

const EventsPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("all");

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("status", "upcoming");
      if (searchQuery) params.append("title", searchQuery);
      if (eventTypeFilter && eventTypeFilter !== "all") {
        params.append("eventType", eventTypeFilter);
      }

      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, eventTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-turf-dark font-sans selection:bg-turf-neon/30">
      {/* Header */}
      <div className="sticky top-0 z-50 overflow-hidden border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-r from-turf-neon/5 via-white/5 to-purple-500/5 opacity-50" />
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between relative z-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-full bg-white/5 border border-white/10 group-hover:border-turf-neon/50 transition-colors">
              <ArrowRight className="w-5 h-5 text-turf-neon rotate-180" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white font-heading italic uppercase">
              Turf<span className="text-turf-neon">Book</span>
            </span>
          </Link>
        </div>
      </div>

      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-turf-neon/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 space-y-12 relative z-10">
        <div className="text-center space-y-6">
          <div className="inline-block">
            <h1 className="text-5xl md:text-7xl font-black text-white font-heading uppercase italic tracking-tighter transform -skew-x-6">
              Upcoming{" "}
              <span className="text-transparent text-stroke-neon">
                Tournaments
              </span>
            </h1>
            <div className="h-2 w-full bg-turf-neon mt-2 transform skew-x-[-15deg]" />
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto text-xl font-medium">
            Join the action! Register for tournaments, leagues, and special
            events happening at our arenas.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto items-center">
          <div className="relative flex-1 w-full group">
            <div className="absolute inset-0 bg-turf-neon/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-turf-neon w-5 h-5 z-10" />
            <Input
              placeholder="SEARCH TOURNAMENTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 bg-black/60 border-2 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon rounded-none h-14 uppercase font-bold tracking-wider relative z-0 transition-all focus:shadow-[0_0_20px_rgba(204,255,0,0.2)]"
            />
          </div>

          <div className="w-full md:w-56 group relative">
            <div className="absolute inset-0 bg-turf-neon/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="bg-black/60 border-2 border-white/10 text-white h-14 rounded-none uppercase font-bold tracking-wider focus:border-turf-neon relative z-10">
                <SelectValue placeholder="ALL TYPES" />
              </SelectTrigger>
              <SelectContent className="bg-black border-2 border-white/10 text-white rounded-none">
                <SelectItem
                  value="all"
                  className="uppercase font-bold focus:bg-turf-neon focus:text-black"
                >
                  All Types
                </SelectItem>
                <SelectItem
                  value="tournament"
                  className="uppercase font-bold focus:bg-turf-neon focus:text-black"
                >
                  Tournament
                </SelectItem>
                <SelectItem
                  value="league"
                  className="uppercase font-bold focus:bg-turf-neon focus:text-black"
                >
                  League
                </SelectItem>
                <SelectItem
                  value="friendly"
                  className="uppercase font-bold focus:bg-turf-neon focus:text-black"
                >
                  Friendly
                </SelectItem>
                <SelectItem
                  value="coaching"
                  className="uppercase font-bold focus:bg-turf-neon focus:text-black"
                >
                  Coaching
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-white/10 border-t-turf-neon rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-turf-neon/20 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 max-w-2xl mx-auto border-2 border-dashed border-white/10 rounded-3xl p-10 bg-white/5">
            <Calendar className="w-20 h-20 text-white/20 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-white mb-2 uppercase italic font-heading">
              No Events Found
            </h3>
            <p className="text-gray-400 font-medium">
              {searchQuery
                ? "No events match your search query."
                : "Check back later for upcoming tournaments and leagues."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <div className="h-full group relative bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden hover:border-turf-neon hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] transition-all duration-300 flex flex-col">
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

                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 flex-1 flex flex-col relative">
                      {/* Decorative Line */}
                      <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-turf-neon/50 to-transparent"></div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center gap-1.5 text-turf-neon font-mono text-xs font-bold uppercase tracking-wider bg-turf-neon/10 px-2 py-1 rounded">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(event.startDate), "MMM d, yyyy")}
                          </div>
                        </div>

                        <h3 className="text-2xl font-black text-white font-heading italic uppercase leading-none mb-2 group-hover:text-turf-neon transition-colors line-clamp-2">
                          {event.title}
                        </h3>
                      </div>

                      <div className="space-y-3 mb-6 flex-1">
                        <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-turf-neon">
                            <Users className="w-4 h-4" />
                          </div>
                          <span className="uppercase tracking-wide text-xs">
                            {event.maxParticipants - event.currentParticipants}{" "}
                            spots left
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
                          <div className="w-8 h-8 rounded bg-white/5 flex items-center justify-center text-turf-neon">
                            <Ticket className="w-4 h-4" />
                          </div>
                          <span className="uppercase tracking-wide text-xs">
                            {event.price === 0
                              ? "Free Entry"
                              : `₹${event.price} Entry Fee`}
                          </span>
                        </div>
                      </div>

                      <NeonButton
                        variant="primary"
                        className="w-full bg-turf-neon hover:bg-turf-neon/80 text-turf-dark font-black rounded-none skew-x-[-10deg] transition-all shadow-lg shadow-neon-green/20 group-hover:shadow-neon-green/50 uppercase tracking-widest text-sm"
                      >
                        <span className="skew-x-[10deg] flex items-center justify-center gap-2">
                          View Details <ArrowRight className="w-4 h-4" />
                        </span>
                      </NeonButton>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsPage;
