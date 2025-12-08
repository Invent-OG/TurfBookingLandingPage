"use client";

import { LogOut } from "lucide-react";

import { useRouter } from "next/navigation";

export const AdminLogoutButton = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("adminId"); // Clear authentication
    router.replace("/admin/login"); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-white/5 transition-colors"
      title="Logout"
    >
      <LogOut size={18} />
    </button>
  );
};
