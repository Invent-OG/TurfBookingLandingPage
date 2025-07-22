"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MarqueeDemo } from "../TestimonialsMarquee/main";

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section
      className="relative py-16 bg-gradient-to-b from-white to-gray-100 overflow-hidden"
      id="testimonials"
      ref={containerRef}
    >
      {/* Blurred Border Effect */}
      <div className="absolute inset-0  border-white/30  rounded-xl " />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it - hear from our satisfied customers.
          </p>
        </motion.div>

        {/* Testimonials Marquee with Glassmorphism Card */}
        <div className="relative p-6 bg-white/20  rounded-2xl  border-white/30 ">
          <MarqueeDemo />
        </div>
      </div>
    </section>
  );
}
