"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { Turf } from "@/types/turf";
import { cn } from "@/lib/utils";
// import { useTurfStore } from "@/lib/store/turf";
import { useTurfs } from "@/hooks/use-turfs";

import { GlassCard } from "@/components/ui/glass-card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function TurfImageGallery() {
  // const { setSelectedTurf } = useTurfStore();
  const { data: turfs = [], isLoading, error } = useTurfs();

  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) {
      toast.error("Error fetching turfs");
    }
  }, [error]);

  useEffect(() => {
    if (!isLoading && turfs.length > 0) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".turf-title-anim",
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: containerRef.current,
              start: "top 80%",
            },
          }
        );

        gsap.fromTo(
          galleryRef.current?.children || [],
          { y: 100, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: galleryRef.current,
              start: "top 85%",
            },
          }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [isLoading, turfs]);

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-center justify-center px-6 py-24 min-h-screen overflow-hidden"
    >
      {/* Background Elements Removed */}

      {/* Heading */}
      <div className="turf-title-anim text-center max-w-4xl mx-auto relative z-10 mb-16 space-y-6">
        <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter">
          Choose Your{" "}
          <span className="text-stroke-neon text-transparent">Turf</span> &{" "}
          <span className="text-turf-neon">Play!</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Football, Cricket, or Multi-Sport—Book the best turf for your game,
          anytime!
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Turf Gallery */}
      <div
        ref={galleryRef}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-7xl relative z-10"
      >
        {isLoading && (
          <div className="col-span-3 text-center py-20">
            <div className="inline-block w-12 h-12 border-4 border-turf-neon border-t-transparent rounded-full animate-spin"></div>
            <p className="text-lg text-turf-neon mt-4 font-bold animate-pulse">
              Loading Arena...
            </p>
          </div>
        )}

        {!isLoading && turfs.length === 0 && (
          <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-20">
            <div className="bg-white/5 rounded-2xl p-8 max-w-md mx-auto border border-white/10 backdrop-blur-sm">
              <p className="text-xl text-gray-300 font-bold mb-2 font-heading uppercase tracking-wide">
                No Arenas Found
              </p>
              <p className="text-gray-500 text-sm">
                It seems quiet here. Check back later for available turfs!
              </p>
            </div>
          </div>
        )}

        {turfs.map((turf) => (
          <GlassCard
            key={turf.id}
            noPadding
            className={cn(
              "overflow-hidden group hover:-translate-y-2 transition-all duration-500 hover:shadow-neon-blue",
              turf.isDisabled ? "opacity-70 grayscale" : "cursor-pointer"
            )}
          >
            {/* Image Container */}
            <div className="relative h-64 overflow-hidden">
              <img
                src={turf.imageUrl || ""}
                alt={turf.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-turf-dark via-transparent to-transparent opacity-80" />

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-xs font-bold text-turf-neon uppercase tracking-wider">
                  {turf.isDisabled ? "Coming Soon" : "Available"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 relative">
              <h3 className="text-2xl font-bold text-white mb-2 font-heading uppercase tracking-wide group-hover:text-turf-blue transition-colors">
                {turf.name}
              </h3>
              <p className="text-gray-400 mb-6 flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-turf-neon"></span>
                Located at {turf.location}
              </p>

              {turf.isDisabled ? (
                <div className="w-full text-center py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-500 font-bold uppercase tracking-wider text-sm">
                  {turf.disabledReason}
                </div>
              ) : (
                <Button
                  disabled={!!turf.isDisabled}
                  onClick={() => {
                    // setSelectedTurf(turf);
                    // No need to set store, just pass ID via URL if needed.
                    // But wait, does booking page read URL?
                    // I will make it read URL param `turfId` if I can.
                    // But for now let's just push to /booking?turfId=ID
                    toast.success("Turf selected: " + turf.name);
                    router.push(`/booking?turfId=${turf.id}`);
                  }}
                  className="w-full bg-turf-neon hover:bg-turf-neon/80 text-turf-dark font-black py-6 rounded-xl transition-all shadow-lg shadow-neon-green/20 group-hover:shadow-neon-green/50 uppercase tracking-widest text-sm"
                >
                  Book Now
                </Button>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
