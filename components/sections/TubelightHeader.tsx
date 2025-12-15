"use client";

import { useState, useEffect } from "react";
import { Home, Star, Phone, Image, Sparkles } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";
import { cn } from "@/lib/utils";
import { useSiteSettings } from "@/hooks/use-settings";

export default function TubelightHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { data: settings } = useSiteSettings();

  const companyName = settings?.companyName || "TurfBook";
  const logoUrl = settings?.logoUrl;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", url: "#home", icon: Home },
    { name: "Events", url: "/events", icon: Star },
    { name: "Gallery", url: "#photos", icon: Image },
    { name: "Features", url: "#features", icon: Sparkles },
    { name: "Contact", url: "#contact", icon: Phone },
  ];

  return (
    <div
      className={cn(
        "sticky top-0 left-0 right-0 z-50 transition-all duration-300 pointer-events-none flex items-center justify-between px-6 pt-6"
      )}
    >
      <div
        className={cn(
          "pointer-events-auto flex items-center gap-3 transition-opacity duration-300",
          isScrolled ? "opacity-0 -translate-y-10" : "opacity-100"
        )}
      >
        {logoUrl ? (
          <div className="relative w-10 h-10 md:w-12 md:h-12 backdrop-blur-sm">
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
          <h1 className="text-white font-heading font-black text-xl md:text-2xl tracking-wide italic leading-none drop-shadow-lg">
            {companyName}
          </h1>
        </div>
      </div>

      <div className="pointer-events-auto">
        <NavBar
          items={navItems}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 sm:top-auto sm:bottom-4 md:relative md:transform-none md:left-auto md:translate-x-0 md:top-auto md:bottom-auto md:mb-0 md:pt-0"
        />
      </div>

      <div className="w-[120px] hidden md:block"></div>
    </div>
  );
}
