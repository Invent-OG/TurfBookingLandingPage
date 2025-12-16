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
import { useSiteSettings } from "@/hooks/use-site-settings";

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
  const { settings } = useSiteSettings();

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
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-turf-dark flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-white/10 border-t-turf-neon rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 bg-turf-neon/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-turf-dark flex flex-col items-center justify-center space-y-6">
        <h1 className="text-4xl text-white font-black font-heading italic uppercase">
          Event Not Found
        </h1>
        <NeonButton
          onClick={() => router.push("/events")}
          variant="primary"
          className="skew-x-[-10deg]"
        >
          <span className="skew-x-[10deg]">Back to Events</span>
        </NeonButton>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-turf-dark pb-24 font-sans selection:bg-turf-neon/30">
      {/* Hero Banner */}
      <div className="relative h-[60vh] w-full overflow-hidden group">
        <img
          src={
            event.bannerImage ||
            "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000&auto=format&fit=crop"
          }
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2s]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-turf-dark via-turf-dark/80 to-transparent"></div>

        {/* Navigation */}
        <div className="absolute top-8 left-8 z-20">
          <button
            onClick={() => router.push("/events")}
            className="group flex items-center justify-center w-12 h-12 rounded-none bg-black/40 border border-white/10 hover:border-turf-neon hover:bg-black/60 transition-all duration-300 skew-x-[-10deg]"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:text-turf-neon skew-x-[10deg]" />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 pb-20 md:p-16 md:pb-24 z-10">
          <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-700">
            {/* Skewed Badge */}
            <div className="inline-block transform skew-x-[-15deg]">
              <div className="bg-turf-neon text-black font-black text-sm uppercase px-6 py-2 shadow-[0_0_20px_rgba(204,255,0,0.4)] border-l-4 border-black">
                {event.eventType}
              </div>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white font-heading italic uppercase leading-none max-w-5xl drop-shadow-2xl">
              {event.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-gray-300 text-lg font-medium tracking-wide">
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm">
                <Calendar className="w-5 h-5 text-turf-neon" />
                <span className="uppercase text-sm">
                  {format(new Date(event.startDate), "MMM d")} -{" "}
                  {format(new Date(event.endDate), "MMM d, yyyy")}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg border border-white/5 backdrop-blur-sm">
                <Clock className="w-5 h-5 text-turf-neon" />
                <span className="uppercase text-sm">
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 relative z-20 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* About Section */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:border-turf-neon/30 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-turf-neon/50"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-turf-neon/50 to-transparent"></div>

            <h2 className="text-3xl font-black text-white font-heading italic uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-turf-neon skew-x-[-15deg]"></span>
              About Event
            </h2>
            <p className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg font-medium">
              {event.description}
            </p>
          </div>

          {/* Rules Section */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:border-turf-neon/30 transition-all duration-300 relative overflow-hidden">
            <h2 className="text-3xl font-black text-white font-heading italic uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-turf-neon skew-x-[-15deg]"></span>
              Rules & Guidelines
            </h2>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-turf-neon" />
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mt-2">
                {event.rules || "No specific rules mentioned."}
              </p>
            </div>
          </div>

          {/* Prizes Section */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-8 hover:border-turf-neon/30 transition-all duration-300 relative overflow-hidden">
            <h2 className="text-3xl font-black text-white font-heading italic uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-1 bg-turf-neon skew-x-[-15deg]"></span>
              Prizes
            </h2>
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              </div>
              <p className="text-gray-300 whitespace-pre-wrap leading-relaxed mt-2 text-lg">
                {event.prizeDetails || "TBA"}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="sticky top-24 bg-black/60 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-xl"></div>

            <div className="space-y-8 relative z-10">
              <div className="flex justify-between items-end pb-6 border-b border-white/10">
                <span className="text-gray-400 font-bold uppercase tracking-wider text-sm mb-1">
                  Entry Fee
                </span>
                <span className="text-4xl font-black text-white italic tracking-tighter">
                  ₹{event.price}
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide">
                  <span className="text-gray-400">Total Slots</span>
                  <span className="text-white">{event.maxParticipants}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-bold uppercase tracking-wide">
                  <span className="text-gray-400">Available</span>
                  <span className="text-turf-neon">
                    {event.maxParticipants - event.currentParticipants}
                  </span>
                </div>

                <div className="relative pt-2">
                  <div className="w-full bg-white/10 h-3 skew-x-[-15deg] overflow-hidden">
                    <div
                      className="bg-turf-neon h-full transition-all duration-500 shadow-[0_0_15px_rgba(204,255,0,0.5)]"
                      style={{
                        width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {(() => {
                const isEventConducted =
                  event.status === "completed" ||
                  event.status === "cancelled" ||
                  new Date(event.endDate) < new Date();

                if (isEventConducted) {
                  return (
                    <div className="w-full bg-gray-600 text-black py-4 font-black uppercase text-center skew-x-[-10deg]">
                      <span className="skew-x-[10deg] block">
                        Registration Closed
                      </span>
                    </div>
                  );
                } else if (event.currentParticipants >= event.maxParticipants) {
                  return (
                    <div className="w-full bg-red-600 text-white py-4 font-black uppercase text-center skew-x-[-10deg]">
                      <span className="skew-x-[10deg] block">Fully Booked</span>
                    </div>
                  );
                }

                return (
                  <div className="transform transition-transform hover:scale-105 duration-200">
                    <EventRegistrationModal
                      eventId={event.id}
                      registrationType={event.registrationType}
                      price={event.price}
                    />
                  </div>
                );
              })()}

              <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold">
                By registering, you agree to the event rules.
              </p>

              <div className="pt-6 mt-6 border-t border-white/10 text-center">
                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2">
                  Need Help?
                </p>
                <a
                  href={`tel:${settings.supportPhone.replace(/\s/g, "")}`}
                  className="text-turf-neon font-black text-xl hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {settings.supportPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage;
