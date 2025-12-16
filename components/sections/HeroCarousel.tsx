"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";
import { ImagesSlider } from "../ui/images-slider";
import { siteConfig } from "@/lib/config";
import { ArrowDown, ArrowDown01, ArrowDownNarrowWide } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

import { useGalleryImages } from "@/hooks/use-gallery-images";

export function HeroCarousel() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { data: galleryImages = [] } = useGalleryImages();

  // Source images exclusively from the gallery as requested
  const displayImages = galleryImages.map((img) => img.imageUrl);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      const tl = gsap.timeline();

      /* Entrance Animation - Temporarily disabled to debug visibility
      tl.from(textRef.current?.children || [], {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power4.out",
      }).from(
        buttonRef.current,
        {
          y: 50,
          opacity: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
      */

      // Scroll Parallax - Removed to prevent visibility issues
      // gsap.to(textRef.current, {
      //   y: 200,
      //   opacity: 0,
      //   scrollTrigger: {
      //     trigger: containerRef.current,
      //     start: "top top",
      //     end: "bottom top",
      //     scrub: 1,
      //   },
      // });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ImagesSlider
      className="relative min-h-[600px] w-[90%] md:w-[80%] p-[5%] flex justify-center container mx-auto mt-[5%] rounded-none border border-white/10 shadow-2xl overflow-hidden"
      images={displayImages}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-turf-dark via-turf-dark/20 to-transparent z-10" />
      <div className="absolute inset-0 bg-black/40 z-0" />

      {/* Sporty decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-turf-neon z-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-turf-neon z-20 opacity-50"></div>

      <div
        ref={containerRef}
        className="z-50 relative flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto"
      >
        <div ref={textRef} className="space-y-6 mb-8 relative">
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-black/80 border border-turf-neon text-turf-neon text-sm font-black uppercase tracking-[0.2em] transform -skew-x-12 shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <span className="w-2 h-2 rounded-full bg-turf-neon animate-pulse shadow-[0_0_8px_#ccff00] skew-x-12"></span>
            <span className="skew-x-12">Premium Sports Arena</span>
          </div>

          <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl text-white uppercase italic tracking-tighter drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] leading-[0.9]">
            <span className="block text-stroke-sm md:text-stroke text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
              Find Your Turf.
            </span>
            <span className="block text-turf-neon drop-shadow-[0_0_20px_rgba(204,255,0,0.5)]">
              Play Anytime.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium tracking-wide">
            {siteConfig.hero.subtitle}
          </p>
        </div>

        <button
          ref={buttonRef}
          onClick={() => {
            router.push("/booking");
          }}
          className="group relative px-10 py-5 bg-turf-neon text-black font-black text-xl uppercase tracking-wider overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(204,255,0,0.4)] transform -skew-x-12"
        >
          <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12"></div>
          <span className="relative z-10 flex items-center gap-3 skew-x-12">
            Book Your Slot <ArrowDown className="w-6 h-6 animate-bounce" />
          </span>
        </button>
      </div>
    </ImagesSlider>
  );
}
