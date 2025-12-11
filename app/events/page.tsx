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
      params.append("status", "upcoming"); // Default to upcoming
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchEvents]);

  return (
    <div className="min-h-screen bg-turf-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-turf-neon/10 via-turf-dark to-turf-dark">
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading tracking-tight">
            Upcoming <span className="text-turf-neon">Tournaments</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Join the action! Register for tournaments, leagues, and special
            events happening at our arenas.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col md:flex-row gap-4 max-w-3xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              placeholder="Search tournaments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 rounded-xl h-12"
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent className="bg-black border border-white/10 text-white">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tournament">Tournament</SelectItem>
                <SelectItem value="league">League</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="coaching">Coaching</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turf-neon"></div>
          </div>
        ) : events.length === 0 ? (
          <GlassCard className="text-center py-20 max-w-2xl mx-auto">
            <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              No Events Found
            </h3>
            <p className="text-gray-400">
              {searchQuery
                ? "No events match your search."
                : "Check back later for upcoming tournaments and leagues."}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <Link href={`/events/${event.id}`} key={event.id}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="h-full"
                >
                  <GlassCard className="h-full flex flex-col p-0 overflow-hidden hover:border-turf-neon/50 transition-all duration-300 group cursor-pointer">
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-turf-neon transition-colors">
                          {event.title}
                        </h3>
                        <div className="space-y-2 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-turf-neon" />
                            <span>
                              {format(new Date(event.startDate), "MMM d, yyyy")}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-turf-neon" />
                            <span>
                              {event.maxParticipants -
                                event.currentParticipants}{" "}
                              spots left
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-turf-neon" />
                            <span>
                              {event.price === 0
                                ? "Free Entry"
                                : `Entry: ₹${event.price}`}
                            </span>
                          </div>
                        </div>
                      </div>

                      <NeonButton
                        variant="primary"
                        className="w-full group-hover:bg-turf-neon group-hover:text-black"
                      >
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </NeonButton>
                    </div>
                  </GlassCard>
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
