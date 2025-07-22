"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

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

      // Fetch admin details from the "users" table
      const { data, error: fetchError } = await supabase
        .from("users") // Change this if your table name is different
        .select("email")
        .eq("id", adminId)
        .single();

      if (fetchError) {
        toast.error("Failed to fetch admin details.");
        return;
      }

      setAdmin(data);
    };

    fetchAdminDetails();
  }, [router, supabase]);

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

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input type="email" value={admin?.email || "Loading..."} disabled />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value="********" disabled />
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full">Reset Password</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Reset Password</DialogTitle>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Button
        onClick={handleLogout}
        className="w-full mt-6 bg-red-500 hover:bg-red-600"
      >
        Logout
      </Button>
    </div>
  );
};

export default AdminSettings;
