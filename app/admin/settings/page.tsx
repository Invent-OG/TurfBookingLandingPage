"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { LogOut, Lock, User, KeyRound, Mail } from "lucide-react";

const AdminSettings = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [admin, setAdmin] = useState<{ email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchAdminDetails = async () => {
      const adminId = localStorage.getItem("adminId");

      const { data, error: fetchError } = await supabase
        .from("users")
        .select("email")
        .eq("id", adminId)
        .single();

      if (fetchError) {
        // Silent fail or toast if needed, but keeping it minimal for now
        console.error("Failed to fetch admin details");
        return;
      }

      setAdmin(data);
    };

    fetchAdminDetails();
  }, [router]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      setLoading(false);
      return;
    }

    const adminId = localStorage.getItem("adminId");
    if (!adminId) {
      toast.error("You are not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Something went wrong.");
        setLoading(false);
        return;
      }

      toast.success("Password updated successfully! Logging out...");
      localStorage.removeItem("adminId");
      router.replace("/admin/login");
    } catch (error) {
      toast.error("Failed to update password. Try again later.");
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    toast.success("Logged out successfully!");
    router.replace("/admin/login");
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl pl-10";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-3xl mx-auto pb-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
          Settings
        </h1>
        <p className="text-gray-400 mt-1">
          Manage your account preferences and security.
        </p>
      </div>

      <div className="space-y-8">
        <GlassCard title="Profile Details" className="overflow-hidden">
          <div className="space-y-6">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="w-16 h-16 rounded-full bg-turf-neon/10 flex items-center justify-center text-turf-neon border border-turf-neon/20">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Administrator</h3>
                <p className="text-gray-400 text-sm">Super Admin Access</p>
              </div>
            </div>

            <div className="space-y-1 relative">
              <Label className={labelClasses}>Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="email"
                  value={admin?.email || "Loading..."}
                  disabled
                  className="bg-black/20 border-white/10 text-gray-400 pl-10 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-1 relative">
              <Label className={labelClasses}>Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input
                  type="password"
                  value="********"
                  disabled
                  className="bg-black/20 border-white/10 text-gray-400 pl-10 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="flex flex-col justify-center items-center text-center p-8">
            <div className="w-12 h-12 rounded-full bg-turf-neon/10 flex items-center justify-center text-turf-neon mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Change Password
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Update your password to keep your account secure.
            </p>

            <Dialog>
              <DialogTrigger asChild>
                <NeonButton variant="secondary" className="w-full">
                  Reset Password
                </NeonButton>
              </DialogTrigger>
              <DialogContent className="bg-turf-dark border border-white/10 text-white sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Reset Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordReset} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Current Password</Label>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>New Password</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm New Password</Label>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>
                  <DialogFooter className="mt-4">
                    <NeonButton
                      type="submit"
                      variant="primary"
                      glow
                      disabled={loading}
                      className="w-full"
                    >
                      {loading ? "Updating..." : "Update Password"}
                    </NeonButton>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </GlassCard>

          <GlassCard className="flex flex-col justify-center items-center text-center p-8 bg-red-500/5 hover:bg-red-500/10 transition-colors border-red-500/20">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Sign Out</h3>
            <p className="text-gray-400 text-sm mb-6">
              Securely log out of your admin account.
            </p>
            <NeonButton
              onClick={handleLogout}
              variant="danger"
              className="w-full"
            >
              Logout
            </NeonButton>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
