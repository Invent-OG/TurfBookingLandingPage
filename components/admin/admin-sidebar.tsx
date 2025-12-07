"use client";

import {
  BrickWall,
  Calendar,
  Home,
  Inbox,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  subItems?: { title: string; url: string }[];
}

const items: MenuItem[] = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Bookings",
    url: "/admin/bookings",
    icon: Inbox,
  },
  {
    title: "Turfs",
    url: "/admin/turfs",
    icon: BrickWall,
  },
  {
    title: "Create Booking",
    url: "/admin/create-booking",
    icon: Calendar,
  },
  {
    title: "Peak Hours",
    url: "/admin/peak-hours",
    icon: Calendar,
  },
  {
    title: "Blocked Dates",
    url: "/admin/blocked-dates",
    icon: Calendar,
    subItems: [
      { title: "Block Date", url: "/admin/blocked-dates/block-date" },
      { title: "Block Date Range", url: "/admin/blocked-dates/date-range" },
      { title: "Block Time", url: "/admin/blocked-dates/block-time" },
    ],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-turf-dark border border-turf-glass-border text-white shadow-neon-green"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 glass-sidebar transition-transform duration-300 z-40 lg:translate-x-0 pt-20 lg:pt-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-full flex flex-col p-6">
          {/* Logo / Brand */}
          <div className="mb-10 px-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-turf-neon shadow-neon-green flex items-center justify-center">
              <span className="text-turf-dark font-bold text-lg">T</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-wider font-heading">
              TURF<span className="text-turf-neon">ADMIN</span>
            </h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
            {items.map((item) => (
              <div key={item.title}>
                <div
                  onClick={() => {
                    if (item.subItems) {
                      toggleMenu(item.title);
                    } else {
                      router.push(item.url);
                      setIsMobileOpen(false);
                    }
                  }}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 group border border-transparent",
                    isActive(item.url)
                      ? "bg-turf-neon/10 text-turf-neon border-turf-neon/20 shadow-[0_0_15px_rgba(204,255,0,0.1)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon
                      size={20}
                      className={cn(
                        "transition-colors",
                        isActive(item.url)
                          ? "text-turf-neon drop-shadow-[0_0_5px_rgba(204,255,0,0.5)]"
                          : "group-hover:text-white"
                      )}
                    />
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        "transition-transform",
                        openMenu === item.title ? "rotate-180" : ""
                      )}
                    />
                  )}
                </div>

                {/* Sub Items */}
                {item.subItems && openMenu === item.title && (
                  <div className="ml-4 pl-4 border-l border-white/10 mt-1 space-y-1">
                    {item.subItems.map((subItem) => (
                      <Link
                        key={subItem.title}
                        href={subItem.url}
                        onClick={() => setIsMobileOpen(false)}
                        className={cn(
                          "block p-2 text-sm rounded-lg transition-colors",
                          pathname === subItem.url
                            ? "text-turf-blue text-glow"
                            : "text-gray-500 hover:text-gray-300"
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Profile / Logout */}
          <div className="mt-auto pt-6 border-t border-white/5">
            {/* We can incorporate the AdminLogoutButton functionality here or keep it simple */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-turf-blue to-purple-600 flex items-center justify-center text-white font-bold shadow-neon-blue">
                A
              </div>
              <div className="flex-1 overflow-hidden">
                <h4 className="text-sm font-semibold text-white truncate">
                  Admin User
                </h4>
                <p className="text-xs text-gray-500 truncate">admin@turf.com</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
