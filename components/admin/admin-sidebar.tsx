"use client";
import {
  BrickWall,
  Calendar,
  Home,
  Inbox,
  Settings,
  User2Icon,
  ChevronDown,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AdminLogoutButton } from "./AdminLogoutButton";

// Menu items.
const items = [
  // {
  //   title: "Dashboard",
  //   url: "/admin/dashboard",
  //   icon: Home,
  // },
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
    title: "Availability",
    url: "/admin/availability",
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
      {
        title: "Block Date",
        url: "/admin/blocked-dates/block-date",
      },
      {
        title: "Block Date Range",
        url: "/admin/blocked-dates/date-range",
      },
      {
        title: "Block Time",
        url: "/admin/blocked-dates/block-time",
      },
    ],
  },
  // {
  //   title: "Users",
  //   url: "/admin/users",
  //   icon: User2Icon,
  // },
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

  const toggleMenu = (title: string) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <div key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a
                        onClick={() =>
                          item.subItems
                            ? toggleMenu(item.title)
                            : router.push(item.url)
                        }
                        className={`flex items-center justify-between space-x-2 cursor-pointer ${
                          pathname === item.url ? "bg-gray-200" : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <item.icon />
                          <span>{item.title}</span>
                        </div>
                        {item.subItems && <ChevronDown className="w-4 h-4" />}
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>

                  {/* Render Sub-items if available */}
                  {item.subItems && openMenu === item.title && (
                    <div className="ml-6 space-y-1">
                      {item.subItems.map((subItem) => (
                        <SidebarMenuItem key={subItem.title}>
                          <SidebarMenuButton asChild>
                            <a
                              onClick={() => router.push(subItem.url)}
                              className={`flex items-center space-x-2 cursor-pointer ${
                                pathname === subItem.url ? "bg-gray-200" : ""
                              }`}
                            >
                              <span>• {subItem.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
