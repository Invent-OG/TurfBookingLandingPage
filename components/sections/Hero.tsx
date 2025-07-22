"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";

export default function Hero() {
  useEffect(() => {
    gsap.timeline()
      .from(".hero-title", {
        opacity: 0,
        y: 100,
        duration: 1,
        ease: "power3.out",
      })
      .from(".hero-subtitle", {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: "power3.out",
      }, "-=0.5")
      .from(".hero-cta", {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power3.out",
      }, "-=0.5");

    gsap.to(".hero-bg", {
      yPercent: 30,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero-section",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }, []);

  return (
    <section className="hero-section relative h-screen flex items-center justify-center overflow-hidden">
      <div className="hero-bg absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1529900748604-07564a03e7a6?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3540&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
        <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6">
          Book Your Turf in Minutes
        </h1>
        <p className="hero-subtitle text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
          Experience seamless booking for your next game. Premium turfs, instant confirmation, and hassle-free scheduling.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="hero-cta bg-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Book Now
        </motion.button>
      </div>
    </section>
  );
}