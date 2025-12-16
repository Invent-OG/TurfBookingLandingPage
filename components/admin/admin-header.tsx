"use client";

import { Bell, Search, Settings } from "lucide-react";
import { useState } from "react";

export function AdminHeader() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="glass-header h-16 lg:h-20 px-4 lg:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Left side spacer (sidebar width) - hidden on mobile if sidebar overlaps, 
          but for sticky layout we handled sidebar position fixed mainly. 
          Here we just need content alignment. */}

      {/* Search Bar - Hidden on small mobile, visible on larger */}
      <div className="flex-1 flex max-w-2xl items-center relative pl-12 lg:pl-0">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 transition-all font-sans"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 text-gray-400 hover:text-white">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* <div className="flex items-center gap-3">
        <button className="p-2 lg:p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-turf-neon rounded-full shadow-[0_0_8px_#ccff00]"></span>
        </button>
        <button className="p-2 lg:p-2.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </div> */}
    </header>
  );
}
