"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassTable } from "@/components/ui/glass-table";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Shield,
  ShieldAlert,
  UserCircle,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Trash2,
} from "lucide-react";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  User,
} from "@/hooks/use-users";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { ConfirmationModal } from "@/components/ui/confirmation-modal";

export default function UsersPage() {
  const { data: users = [], isLoading, error, refetch } = useUsers();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<"admin" | "sub-admin" | "user">(
    "user"
  );

  const filteredUsers = users.filter(
    (user) =>
      (user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (roleFilter === "all" || user.role === roleFilter)
  );

  const handleUpdateRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      await updateUserMutation.mutateAsync({
        id: selectedUser.id,
        data: { role: newRole },
      });
      toast.success(`User ${selectedUser.email}'s role updated to ${newRole}`);
      setRoleDialogOpen(false);
      setSelectedUser(null);
      refetch(); // Re-fetch users to update the list
    } catch (err) {
      console.error("Error updating user role:", err);
      toast.error("Failed to update user role.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      await deleteUserMutation.mutateAsync(selectedUser.id);
      toast.success(`User ${selectedUser.email} deleted successfully.`);
      setDeleteDialogOpen(false);
      setSelectedUser(null);
      refetch(); // Re-fetch users to update the list
    } catch (err) {
      console.error("Error deleting user:", err);
      toast.error("Failed to delete user.");
    }
  };

  const columns = [
    {
      header: "User",
      accessor: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-turf-neon border border-white/10">
            <UserCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="font-medium text-white">{user.name || "N/A"}</div>
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <Mail className="w-3 h-3" /> {user.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Role",
      accessor: (user: User) => (
        <div className="flex items-center gap-2">
          <Shield
            className={cn("w-4 h-4", {
              "text-turf-blue": user.role === "user",
              "text-turf-green": user.role === "sub-admin",
              "text-turf-neon": user.role === "admin",
            })}
          />
          <span className="capitalize text-gray-300">
            {user.role || "User"}
          </span>
        </div>
      ),
    },
    // Phone removed as it does not exist in schema
    {
      header: "Joined",
      accessor: (user: User) => (
        <span className="text-gray-400 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {user.createdAt
            ? format(new Date(user.createdAt), "MMM d, yyyy")
            : "-"}
        </span>
      ),
    },
    {
      header: "Actions",
      accessor: (item: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <NeonButton variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </NeonButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(item);
                setNewRole(
                  (item.role as "admin" | "sub-admin" | "user") || "user"
                );
                setRoleDialogOpen(true);
              }}
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Change Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setSelectedUser(item);
                setDeleteDialogOpen(true);
              }}
              className="text-red-500 hover:text-red-400 focus:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (error) {
    toast.error("Failed to load users: " + error.message);
  }

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
          <NeonButton variant="primary" glow onClick={() => refetch()}>
            <Users className="w-4 h-4 mr-2" /> Refresh List
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
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <GlassTable
          columns={columns}
          data={filteredUsers}
          isLoading={isLoading}
        />
      </GlassCard>

      <ConfirmationModal
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteUser}
        title="Delete User"
        description={`Are you sure you want to delete user "${selectedUser?.email}"? This action cannot be undone.`}
        loading={deleteUserMutation.isPending}
      />
    </div>
  );
}
