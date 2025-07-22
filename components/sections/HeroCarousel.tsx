"use client";
import { motion } from "motion/react";
import React from "react";
import { ImagesSlider } from "../ui/images-slider";
import { siteConfig } from "@/lib/config";
import { ArrowDown, ArrowDown01, ArrowDownNarrowWide } from "lucide-react";
import { useRouter } from "next/navigation";

export function HeroCarousel() {
  const router = useRouter();

  return (
    <ImagesSlider className=" relative" images={siteConfig.hero.images}>
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="z-50 flex flex-col justify-center items-center"
      >
        <div className="flex flex-col gap-2 px-6">
          <motion.p className="font-bold text-5xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 ">
            {siteConfig.hero.title}
          </motion.p>
          <motion.p className="  text-sm md:text-xl px-5 text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 ">
            {siteConfig.hero.subtitle}
          </motion.p>
        </div>
        <button
          onClick={() => {
            router.push("/booking");
          }}
          className="px-4 py-2 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-lg relative mt-4"
        >
          <span>Book Now</span>
          <div className="absolute inset-x-0  h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
        </button>
      </motion.div>
    </ImagesSlider>
  );
}
