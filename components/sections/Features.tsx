"use client";

import { useEffect, useRef } from "react";
import { Calendar, Clock, CreditCard, Users } from "lucide-react";
import { siteConfig } from "@/lib/config";

import { GlassCard } from "@/components/ui/glass-card";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function Features() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading Animation
      gsap.from(".feature-heading", {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
        },
      });

      // Cards Stagger Animation
      gsap.from(cardsRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top 85%",
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      ref={containerRef}
      className="relative py-24 px-6 overflow-hidden"
    >
      {/* Background Elements Removed for Global Background */}
      <div className="absolute inset-0 pointer-events-none"></div>

      {/* Heading */}
      <div className="feature-heading text-center max-w-4xl mx-auto relative z-10 mb-16 space-y-6">
        <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter">
          Why{" "}
          <span className="text-stroke-neon text-transparent">Choose Us?</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Experience top-tier turf booking with our premium features designed
          for athletes.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Features Grid */}
      <div
        ref={cardsRef}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10 px-4"
      >
        {siteConfig.features.map((feature, index) => (
          <div key={index} className="group relative">
            <div className="h-full bg-turf-dark/40 border border-white/10 p-8 transform skew-x-[-10deg] hover:border-turf-neon hover:bg-white/5 transition-all duration-300 hover:-translate-y-2 group-hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] relative overflow-hidden">
              {/* Decorative Neon Bars */}
              <div className="absolute top-0 right-0 w-2 h-2 bg-turf-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 bg-turf-neon opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="transform skew-x-[10deg]">
                <div className="mb-6 inline-flex items-center justify-center p-4 bg-black/50 border border-turf-neon/30 group-hover:border-turf-neon group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] transition-all duration-300 transform -skew-x-12">
                  <feature.icon className="h-8 w-8 text-turf-neon transform skew-x-12" />
                </div>

                <h3 className="text-2xl font-black text-white mb-4 font-heading italic uppercase tracking-wide group-hover:text-turf-neon transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed font-bold tracking-wide">
                  {feature.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
