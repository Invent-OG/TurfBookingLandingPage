"use client";

import { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTable } from "@/components/ui/glass-table";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { Filter, Search, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type User = {
  id: string;
  email: string;
  role: string | null;
  created_at: string;
  full_name?: string;
  phone?: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Determine which table to fetch from. Usually 'users' or 'profiles' in Supabase.
      // Based on settings page, it uses 'users'.
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "User",
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-turf-neon border border-white/10">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-white">
              {user.full_name || "N/A"}
            </div>
            <div className="text-xs text-gray-400">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-turf-blue" />
          <span className="capitalize text-gray-300">
            {user.role || "User"}
          </span>
        </div>
      ),
    },
    {
      header: "Phone",
      accessor: (user: User) => (
        <span className="text-gray-400">{user.phone || "-"}</span>
      ),
    },
    {
      header: "Joined",
      accessor: (user: User) => (
        <span className="text-gray-400">
          {user.created_at
            ? format(new Date(user.created_at), "MMM d, yyyy")
            : "-"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
            User Management
          </h1>
          <p className="text-gray-400 mt-1">
            View and manage registered users and their roles.
          </p>
        </div>
        <div className="flex gap-3">
          <NeonButton variant="ghost">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </NeonButton>
          <NeonButton variant="primary" glow onClick={fetchUsers}>
            Refresh List
          </NeonButton>
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-white/5 bg-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              className="pl-9 bg-black/20 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <GlassTable
          columns={columns}
          data={filteredUsers}
          isLoading={loading}
        />
      </GlassCard>
    </div>
  );
}
