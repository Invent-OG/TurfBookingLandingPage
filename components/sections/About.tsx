"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AboutUs() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <section
      id="about-us"
      className="relative min-h-screen flex items-center justify-center bg-black/80 text-white px-6 md:px-12 py-16"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=1920&q=80"
          alt="Background"
          fill
          priority
          className="object-cover brightness-75"
        />
      </div>

      {/* Content Wrapper */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10"
      >
        {/* Left: Image with Glass Effect */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={inView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 relative"
        >
          <div className="relative rounded-2xl overflow-hidden shadow-lg border border-white/20 backdrop-blur-lg bg-white/10">
            <Image
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8MHx8&auto=format&fit=crop&w=1284&q=80"
              alt="About Us"
              width={600}
              height={400}
              priority
              className="object-cover w-full h-full rounded-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>
        </motion.div>

        {/* Right: Content with Call to Action */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full md:w-1/2 space-y-6 text-center md:text-left"
        >
          <h2 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-teal-300">
            About Us
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            At{" "}
            <span className="text-green-400 font-semibold">Turf Booking</span>,
            we redefine sports facility reservations. Our mission is to offer a
            seamless, transparent, and premium booking experience.
          </p>
          <p className="text-lg text-gray-300 leading-relaxed">
            Whether you're an athlete, a team, or an event organizer, our
            state-of-the-art platform ensures you get the best turf, with 24/7
            support and real-time availability.
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Button className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl shadow-lg transition">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
