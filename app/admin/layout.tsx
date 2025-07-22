"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);
  const router = useRouter();
  const pathname = usePathname(); // Get current page path

  useEffect(() => {
    const adminId = localStorage.getItem("adminId");

    if (!adminId) {
      setIsAuth(false);
      if (pathname !== "/admin/login") {
        router.replace("/admin/login"); // Redirect only if not on login page
      }
    } else {
      setIsAuth(true);
    }
  }, [router, pathname]);

  // Prevent layout from wrapping the login page
  if (pathname === "/admin/login") {
    return <>{children}</>; // Only render login page content
  }

  if (isAuth === null) {
    return <p className="text-center mt-10">Loading...</p>; // Prevents flickering
  }

  if (!isAuth) {
    return null; // Prevent rendering if not authenticated
  }

  return (
    <SidebarProvider>
      <AdminSidebar />
      <main className="h-screen w-full gap-5">
        <SidebarTrigger />
        <div className="w-full lg:p-10">{children}</div>
      </main>
    </SidebarProvider>
  );
};

export default AdminLayout;
