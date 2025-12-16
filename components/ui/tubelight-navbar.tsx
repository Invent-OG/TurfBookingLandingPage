"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
}

export function NavBar({ items, className }: NavBarProps) {
  const [activeTab, setActiveTab] = useState(items[0].name);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={cn(
        "fixed bottom-0 sm:top-0 left-1/2 -translate-x-1/2 z-50 mb-6 sm:pt-6",
        className
      )}
    >
      <div className="flex items-center gap-1 bg-black/80 border border-white/10 backdrop-blur-md py-1 px-1 transform -skew-x-12 shadow-[0_0_20px_rgba(204,255,0,0.15)] hover:border-turf-neon/50 transition-colors duration-300">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.name;

          return (
            <Link
              key={item.name}
              href={item.url}
              onClick={() => setActiveTab(item.name)}
              className={cn(
                "relative cursor-pointer text-sm font-black italic uppercase tracking-wider px-6 py-2.5 transition-colors overflow-hidden",
                isActive ? "text-black" : "text-gray-400 hover:text-white"
              )}
            >
              <span className="relative z-10 block transform skew-x-12 hidden md:inline">
                {item.name}
              </span>
              <span className="relative z-10 block transform skew-x-12 md:hidden">
                <Icon size={20} strokeWidth={2.5} />
              </span>
              {isActive && (
                <motion.div
                  layoutId="sport-active"
                  className="absolute inset-0 bg-turf-neon shadow-[0_0_15px_rgba(204,255,0,0.5)] -z-0"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                >
                  {/* Decorative shine line */}
                  <div className="absolute top-0 right-0 w-[1px] h-full bg-white/50 opacity-50"></div>
                </motion.div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
