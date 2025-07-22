"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Calendar, Clock, CreditCard, Users } from "lucide-react";
import { siteConfig } from "@/lib/config";

export default function Features() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="features"
      className="relative py-20 px-6 overflow-hidden bg-gray-900 text-white"
    >
      {/* Background Gradient & Glows */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(0,255,170,0.15),_transparent)]"></div>

      {/* Heading */}

      <div className="text-center max-w-7xl  mx-auto relative z-10 mb-16">
        <h2 className="text-4xl md:text-5xl font-extrabold text-white">
          Why Choose Us?
        </h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-2">
          H Experience top-tier turf booking with our premium features.
        </p>
      </div>

      {/* Features Grid */}
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10"
      >
        {siteConfig.features.map((feature, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-gray-800 p-8 rounded-2xl shadow-lg hover:shadow-neon transition-all transform hover:scale-105 relative border border-gray-700"
          >
            {/* Neon Glow Effect */}
            <div className="absolute inset-0 rounded-2xl border border-neon-green opacity-30 shadow-lg shadow-neon-green hover:opacity-60 transition"></div>

            {/* Icon */}
            <feature.icon className="h-12 w-12 text-neon-green mb-6" />
            <h3 className="text-xl font-semibold text-white mb-4">
              {feature.title}
            </h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Floating Accents */}
      <div className="absolute top-20 right-10 w-6 h-6 bg-neon-green rounded-full opacity-30 animate-bounce"></div>
      <div className="absolute bottom-10 left-10 w-8 h-8 bg-neon-green rounded-full opacity-30 animate-pulse"></div>
    </section>
  );
}
