"use client";

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
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
    >
      Logout
    </button>
  );
};
