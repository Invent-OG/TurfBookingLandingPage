"use client";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import React, { useEffect, useRef } from "react";
import { ImagesSlider } from "../ui/images-slider";
import { siteConfig } from "@/lib/config";
import { ArrowDown, ArrowDown01, ArrowDownNarrowWide } from "lucide-react";
import { useRouter } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

export function HeroCarousel() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance Animation
      const tl = gsap.timeline();

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

      // Scroll Parallax
      gsap.to(textRef.current, {
        y: 200,
        opacity: 0,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <ImagesSlider
      className="relative  h-[80%] w-[80%] p-[5%] flex justify-center container  mx-auto mt-[10%] rounded-[50px]"
      images={siteConfig.hero.images}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-turf-dark via-turf-dark/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-black/40 z-0" />

      <div
        ref={containerRef}
        className="z-50 flex flex-col justify-center items-center text-center px-4 max-w-5xl mx-auto mt-[10%]"
      >
        <div ref={textRef} className="space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-turf-neon/10 border border-turf-neon/20 text-turf-neon text-sm font-bold uppercase tracking-widest backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-turf-neon animate-pulse shadow-[0_0_8px_#ccff00]"></span>
            Premium Sports Arena
          </div>

          <h1 className="font-heading font-black text-5xl md:text-7xl lg:text-8xl text-white uppercase italic tracking-tighter drop-shadow-lg">
            {siteConfig.hero.title}
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            {siteConfig.hero.subtitle}
          </p>
        </div>

        <button
          ref={buttonRef}
          onClick={() => {
            router.push("/booking");
          }}
          className="group relative px-8 py-4 bg-turf-neon text-turf-dark font-bold text-lg rounded-xl overflow-hidden transition-all hover:scale-105 hover:shadow-neon-green"
        >
          <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300 transform skew-y-12"></div>
          <span className="relative z-10 flex items-center gap-2">
            Book Your Slot <ArrowDown className="w-5 h-5 animate-bounce" />
          </span>
        </button>
      </div>
    </ImagesSlider>
  );
}
