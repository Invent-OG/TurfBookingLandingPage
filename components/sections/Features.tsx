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
      {/* Background Gradient & Glows Removed for seamless look */}
      <div className="absolute inset-0 pointer-events-none"></div>

      {/* Heading */}
      <div className="feature-heading text-center max-w-3xl mx-auto relative z-10 mb-20 space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-white font-heading uppercase italic tracking-tight">
          Why <span className="text-turf-neon">Choose Us?</span>
        </h2>
        <p className="text-lg text-gray-400">
          Experience top-tier turf booking with our premium features designed
          for athletes.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Features Grid */}
      <div
        ref={cardsRef}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10"
      >
        {siteConfig.features.map((feature, index) => (
          <div key={index}>
            <GlassCard className="h-full group hover:bg-white/5 transition-all duration-300">
              <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:bg-turf-neon/10 transition-colors">
                <feature.icon className="h-8 w-8 text-turf-neon group-hover:drop-shadow-[0_0_8px_rgba(204,255,0,0.8)] transition-all" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-heading uppercase tracking-wide">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </GlassCard>
          </div>
        ))}
      </div>
    </section>
  );
}
