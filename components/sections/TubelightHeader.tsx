"use client";

import { useState, useEffect } from "react";
import {
  Home,
  Star,
  Phone,
  ShieldCheck,
  User,
  Image,
  Sparkles,
} from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar"; // This import might become unused if NavBar is replaced by the new structure.
import { cn } from "@/lib/utils"; // Assuming cn utility is available from this path or similar.

interface TubelightHeaderProps {
  companyName: string;
  logoUrl?: string | null;
}

export default function TubelightHeader({
  companyName,
  logoUrl,
}: TubelightHeaderProps) {
  const [activeTab, setActiveTab] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "Gallery", url: "#photos", icon: Image }, // Updated to Gallery
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "Contact", url: "#contact", icon: Phone },
  ];

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none flex items-center justify-between px-6 pt-6"
      )}
    >
      {/* Branding - Pointer events auto to allow clicking */}
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-3 transition-opacity duration-300",
          isScrolled ? "opacity-0 -translate-y-10" : "opacity-100" // Hide on scroll if desired, or keep sticky.
          // User requested "top of the hero section", usually implies visible initially.
          // I will make it fade out on scroll to keep the view clean, or keep it.
          // Let's keep it clean: fade out when scrolled down, as the pill nav stays.
        )}
      >
        {logoUrl ? (
          <div className="relative w-10 h-10 md:w-12 md:h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(204,255,0,0.3)] border border-white/10 bg-black/50 backdrop-blur-sm">
            <img
              src={logoUrl}
              alt={companyName}
              className="object-cover w-full h-full"
            />
          </div>
        ) : (
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-turf-neon to-turf-neon/70 flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <span className="text-black font-black text-lg font-heading italic">
              {companyName.charAt(0)}
            </span>
          </div>
        )}
        <div className="flex flex-col">
          <span className="text-turf-neon text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase">
            Welcome to
          </span>
          <h1 className="text-white font-heading font-black text-xl md:text-2xl tracking-wide italic leading-none drop-shadow-lg">
            {companyName}
          </h1>
        </div>
      </div>

      <div className="pointer-events-auto">
        <div
          className={cn(
            "flex items-center gap-1 md:gap-3 bg-white/5 border border-white/10 backdrop-blur-xl py-2 px-2 rounded-full shadow-lg transition-all duration-300",
            isScrolled ? "bg-black/50 border-white/5 py-1.5" : ""
          )}
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.name;
            const Icon = item.icon;

            return (
              <a
                key={item.name}
                href={item.url}
                onClick={() => setActiveTab(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-4 md:px-6 py-2 rounded-full transition-all duration-300 flex items-center gap-2",
                  isActive
                    ? "text-turf-neon bg-white/10 shadow-[0_0_20px_rgba(204,255,0,0.15)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span className="relative z-10 hidden md:inline">
                  {item.name}
                </span>
                <Icon size={18} className="md:hidden" />
                {isActive && (
                  <span className="absolute inset-0 bg-turf-neon/5 rounded-full blur-md" />
                )}
              </a>
            );
          })}
        </div>
      </div>

      {/* Spacer for Right side alignment if needed, or just let Space-Between handle it */}
      <div className="w-[120px] hidden md:block"></div>
    </div>
  );
}
