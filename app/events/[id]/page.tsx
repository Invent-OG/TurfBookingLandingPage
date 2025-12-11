"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Calendar,
  MapPin,
  Users,
  Ticket,
  ArrowLeft,
  Clock,
  Trophy,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { EventRegistrationModal } from "@/components/events/EventRegistrationModal";

interface Event {
  id: string;
  title: string;
  description: string;
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
  registrationType: "individual" | "team";
  prizeDetails: string;
  rules: string;
  turfId: string;
}

const EventDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/events/${id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setEvent(data);
      } catch (error) {
        console.error(error);
        // toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-turf-dark flex items-center justify-center text-turf-neon">
        Loading...
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-turf-dark flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl text-white">Event Not Found</h1>
        <NeonButton onClick={() => router.push("/events")}>
          Back to Events
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-turf-dark pb-20">
      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={
            event.bannerImage ||
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-turf-dark via-turf-dark/60 to-transparent"></div>
        <div className="absolute top-8 left-8">
          <NeonButton
            variant="ghost"
            onClick={() => router.push("/events")}
            className="rounded-full p-2 h-12 w-12 bg-black/20 backdrop-blur-md border border-white/10"
          >
            <ArrowLeft className="w-6 h-6" />
          </NeonButton>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-700">
            <Badge className="bg-turf-neon text-turf-dark text-lg font-bold px-4 py-1 mb-4">
              {event.eventType}
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white font-heading leading-tight max-w-4xl">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-lg">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-turf-neon" />
                <span>
                  {format(new Date(event.startDate), "MMM d")} -{" "}
                  {format(new Date(event.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-turf-neon" />
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <GlassCard title="About Event">
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
              {event.description}
            </p>
          </GlassCard>

          <GlassCard title="Rules & Guidelines">
            <div className="flex gap-4">
              <FileText className="w-6 h-6 text-turf-neon flex-shrink-0 mt-1" />
              <p className="text-gray-300 whitespace-pre-wrap">
                {event.rules || "No specific rules mentioned."}
              </p>
            </div>
          </GlassCard>

          <GlassCard title="Prizes">
            <div className="flex gap-4">
              <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <p className="text-gray-300 whitespace-pre-wrap">
                {event.prizeDetails || "TBA"}
              </p>
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <GlassCard className="sticky top-24 border-turf-neon/30">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400">Registration Fee</span>
                <span className="text-3xl font-bold text-white">
                  ₹{event.price}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Total Slots</span>
                  <span className="text-white font-medium">
                    {event.maxParticipants}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400">Available</span>
                  <span className="text-turf-neon font-bold">
                    {event.maxParticipants - event.currentParticipants}
                  </span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-turf-neon h-full transition-all duration-300"
                    style={{
                      width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>

              {(() => {
                const isEventConducted =
                  event.status === "completed" ||
                  event.status === "cancelled" ||
                  new Date(event.endDate) < new Date();

                if (isEventConducted) {
                  return (
                    <NeonButton
                      disabled
                      className="w-full bg-gray-500/20 text-gray-500 border-gray-500"
                    >
                      Registration Closed
                    </NeonButton>
                  );
                } else if (event.currentParticipants >= event.maxParticipants) {
                  return (
                    <NeonButton
                      disabled
                      className="w-full bg-red-500/20 text-red-500 border-red-500"
                    >
                      Fully Booked
                    </NeonButton>
                  );
                }

                return (
                  <EventRegistrationModal
                    eventId={event.id}
                    registrationType={event.registrationType}
                    price={event.price}
                  />
                );
              })()}

              <p className="text-xs text-center text-gray-500 mt-4">
                By registering, you agree to the event rules and guidelines.
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
