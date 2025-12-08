"use client";

import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  PlusCircle,
  Clock,
  Ban,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Ticket,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { AdminLogoutButton } from "./AdminLogoutButton";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  subItems?: { title: string; url: string }[];
}

interface SidebarSection {
  title?: string;
  items: MenuItem[];
}

const sections: SidebarSection[] = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Bookings",
        url: "/admin/bookings",
        icon: Ticket,
      },
      {
        title: "Customers",
        url: "/admin/customers",
        icon: Users,
      },
      {
        title: "Turfs",
        url: "/admin/turfs",
        icon: MapPin,
      },
      {
        title: "Gallery",
        url: "/admin/gallery",
        icon: ImageIcon,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        title: "Peak Hours",
        url: "/admin/peak-hours",
        icon: Clock,
      },
      {
        title: "Blocked Dates",
        url: "/admin/blocked-dates",
        icon: Ban,
        subItems: [
          { title: "Block Date", url: "/admin/blocked-dates/block-date" },
          { title: "Block Date Range", url: "/admin/blocked-dates/date-range" },
          { title: "Block Time", url: "/admin/blocked-dates/block-time" },
        ],
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "Settings",
        url: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Branding State
  const [branding, setBranding] = useState({
    companyName: "TurfBook",
    logoUrl: null as string | null,
  });

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setBranding({
            companyName: data.companyName || "TurfBook",
            logoUrl: data.logoUrl,
          });
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      }
    };
    fetchBranding();
  }, []);

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const isActive = (url: string) =>
    pathname === url || pathname.startsWith(url + "/");

  // Helper to split company name for styling (e.g., first word normal, rest neon)
  const formatCompanyName = (name: string) => {
    const parts = name.split(" ");
    if (parts.length === 1) {
      // If single word, split roughly in half for effect, or just standard
      if (name.length > 4) {
        const mid = Math.ceil(name.length / 2);
        return (
          <>
            {name.slice(0, mid)}
            <span className="text-turf-neon">{name.slice(mid)}</span>
          </>
        );
      }
      return <span className="text-turf-neon">{name}</span>;
    }
    // Multi-word: First word white, rest neon
    return (
      <>
        {parts[0]}{" "}
        <span className="text-turf-neon">{parts.slice(1).join(" ")}</span>
      </>
    );
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-turf-dark border border-white/10 text-white shadow-lg"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 bg-turf-dark/95 border-r border-white/5 transition-transform duration-300 z-40 lg:translate-x-0 overflow-hidden flex flex-col",
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo / Brand */}
        <div className="h-20 flex items-center px-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <div className="relative w-9 h-9">
                <Image
                  src={branding.logoUrl}
                  alt="Logo"
                  fill
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-turf-neon to-turf-neon/70 flex items-center justify-center shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                <span className="text-black font-black text-lg font-heading italic">
                  {branding.companyName.charAt(0)}
                </span>
              </div>
            )}

            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-white tracking-wide font-heading leading-none">
                {formatCompanyName(branding.companyName)}
              </h1>
              <span className="text-[10px] text-gray-500 font-medium tracking-widest uppercase mt-1">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* Primary Action */}
        <div className="px-4 mt-6 mb-2">
          <Link
            href="/admin/create-booking"
            className="flex items-center justify-center gap-2 w-full bg-turf-neon hover:bg-turf-neon/90 text-black font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(204,255,0,0.15)] group"
          >
            <PlusCircle
              size={20}
              className="group-hover:scale-110 transition-transform"
            />
            <span>Create Booking</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {sections.map((section, idx) => (
            <div key={idx}>
              {section.title && (
                <h3 className="px-3 mb-3 text-xs font-bold text-gray-500 uppercase tracking-widest">
                  {section.title}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
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
                        "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group relative overflow-hidden",
                        isActive(item.url)
                          ? "bg-white/5 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {isActive(item.url) && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-turf-neon rounded-r-full" />
                      )}

                      <div className="flex items-center gap-3 relative z-10">
                        <item.icon
                          size={18}
                          className={cn(
                            "transition-colors",
                            isActive(item.url)
                              ? "text-turf-neon"
                              : "text-gray-500 group-hover:text-gray-300"
                          )}
                        />
                        <span className="font-medium text-sm">
                          {item.title}
                        </span>
                      </div>
                      {item.subItems && (
                        <ChevronDown
                          size={14}
                          className={cn(
                            "transition-transform text-gray-500",
                            openMenu === item.title ? "rotate-180" : ""
                          )}
                        />
                      )}
                    </div>

                    {/* Sub Items */}
                    {item.subItems && openMenu === item.title && (
                      <div className="ml-9 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                        {item.subItems.map((subItem) => (
                          <Link
                            key={subItem.title}
                            href={subItem.url}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                              "block px-3 py-2 text-xs rounded-md transition-colors relative",
                              pathname === subItem.url
                                ? "text-turf-neon font-medium bg-turf-neon/5"
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
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white text-sm font-bold border border-white/10">
              A
            </div>
            <div className="flex-1 overflow-hidden">
              <h4 className="text-sm font-bold text-white truncate">Admin</h4>
              <p className="text-xs text-gray-500 truncate">Manager</p>
            </div>
            <AdminLogoutButton />
          </div>
        </div>
      </aside>
    </>
  );
}
