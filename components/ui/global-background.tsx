"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function GlobalBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate Orbs
      gsap.to(".orb-1", {
        x: "20vw",
        y: "20vh",
        duration: 20,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".orb-2", {
        x: "-20vw",
        y: "-20vh",
        duration: 25,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(".orb-3", {
        x: "10vw",
        y: "-15vh",
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1] overflow-hidden bg-[#0A0A0A]"
    >
      {/* 1. Base Gradient - Richer Dark Sporty Theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black"></div>

      {/* 2. Strong Techn/Sport Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      ></div>

      {/* 3. Dynamic Mesh Gradient / Aurora Effect */}
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-turf-neon/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent"></div>

      {/* 4. Animated Sporty Orbs (Intensified) */}
      <div className="orb-1 absolute top-[-20%] left-[-10%] w-[1000px] h-[1000px] bg-turf-neon/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
      <div className="orb-2 absolute bottom-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-turf-neon/5 rounded-full blur-[150px] mix-blend-screen"></div>

      {/* 5. Overlay Texture - Diagonal Carbon Fiber-ish look */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, #000 0, #000 2px, transparent 0, transparent 10px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Vignette for cinematic focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,black_100%)]"></div>
    </div>
  );
}
