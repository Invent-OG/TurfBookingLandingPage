"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Login failed");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminId", data.adminId);

      toast.success("Welcome back, Admin!");
      router.push("/admin/bookings");
    } catch (error) {
      toast.error("Something went wrong. Try again later.");
    }
    setLoading(false);
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl py-6";

  return (
    <div className="flex items-center justify-center min-h-screen bg-turf-dark relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-turf-neon/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-turf-blue/10 rounded-full blur-[150px]" />
      </div>

      <div className="w-full max-w-md p-6 relative z-10">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-turf-neon to-turf-blue mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <ShieldCheck className="w-8 h-8 text-turf-dark" />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-wider font-heading mb-2">
            TURF<span className="text-turf-neon text-glow">ADMIN</span>
          </h1>
          <p className="text-gray-400">Secure Access Portal</p>
        </div>

        <GlassCard className="p-8 backdrop-blur-2xl bg-white/5 border-white/10 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-gray-300 ml-1">Email Address</Label>
              <Input
                type="email"
                placeholder="admin@turf.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClasses}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300 ml-1">Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={inputClasses}
              />
            </div>

            <div className="pt-4">
              <NeonButton
                type="submit"
                className="w-full py-6 text-base shadow-neon-green"
                glow
                disabled={loading}
                variant="primary"
              >
                {loading ? "Authenticating..." : "Access Dashboard"}
              </NeonButton>
            </div>
          </form>
        </GlassCard>

        <p className="text-center text-gray-500 text-sm mt-8">
          &copy; {new Date().getFullYear()} Turf Manager Grid. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
