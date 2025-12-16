"use client";

import { useRef, useEffect } from "react";
import { MarqueeDemo } from "../TestimonialsMarquee/main";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(textRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      className="relative py-24 overflow-hidden"
      id="testimonials"
      ref={containerRef}
    >
      {/* Background Elements Removed for Global Background */}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <div
          ref={textRef}
          className="text-center max-w-4xl mx-auto relative z-10 mb-16 space-y-6"
        >
          <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter">
            What Our{" "}
            <span className="text-stroke-neon text-transparent">Players</span>{" "}
            <span className="text-turf-neon">Say</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our community of
            athletes.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
        </div>

        {/* Testimonials Marquee with Glassmorphism Card */}
        <div className="relative p-1 rounded-2xl  to-transparent">
          <MarqueeDemo />
        </div>
      </div>
    </section>
  );
}
