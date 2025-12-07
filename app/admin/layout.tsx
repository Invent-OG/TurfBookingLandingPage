"use client";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header"; // NEW
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
    return (
      <div className="h-screen w-full flex items-center justify-center bg-turf-dark text-turf-neon">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-turf-neon"></div>
      </div>
    );
  }

  if (!isAuth) {
    return null; // Prevent rendering if not authenticated
  }

  return (
    <div className="min-h-screen w-full bg-turf-dark flex font-sans selection:bg-turf-neon/30 selection:text-turf-neon">
      <AdminSidebar />
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen relative z-0">
        <AdminHeader />
        <main className="flex-1 p-4 lg:p-10 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
