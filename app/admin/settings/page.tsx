"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Loader2, Save, User, Globe, Shield } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is installed/used
import imageCompression from "browser-image-compression";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  // Branding States
  const [savingBranding, setSavingBranding] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Account States
  const [savingAccount, setSavingAccount] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    Promise.all([fetchSettings(), fetchProfile()]).finally(() =>
      setLoading(false)
    );
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setCompanyName(data.companyName || "TurfBook");
        setSupportEmail(data.supportEmail || "");
        setLogoUrl(data.logoUrl);
      }
    } catch (error) {
      console.error("Failed to load settings");
    }
  };

  const fetchProfile = async () => {
    const adminId = localStorage.getItem("adminId");
    if (!adminId) return;

    try {
      const res = await fetch(`/api/admin/auth/profile?adminId=${adminId}`);
      if (res.ok) {
        const data = await res.json();
        setAdminEmail(data.email);
      }
    } catch (error) {
      console.error("Failed to load profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingBranding(true);

    try {
      const formData = new FormData();
      formData.append("companyName", companyName);
      formData.append("supportEmail", supportEmail);
      if (selectedFile) {
        let uploadFile = selectedFile;
        // Compress if image
        if (selectedFile.type.startsWith("image/")) {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            uploadFile = await imageCompression(selectedFile, options);
          } catch (error) {
            console.warn("Logo compression failed:", error);
          }
        }
        formData.append("logo", uploadFile);
      }

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const updated = await res.json();
        setLogoUrl(updated.logoUrl);
        setPreviewUrl(null);
        setSelectedFile(null);
        alert("Branding settings updated!");
        window.location.reload();
      } else {
        const data = await res.json();
        alert(`Failed: ${data.details || data.error}`);
      }
    } catch (error) {
      alert("Error saving branding settings");
    } finally {
      setSavingBranding(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Current password is required to make account changes");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    setSavingAccount(true);
    try {
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        alert("Admin ID missing. Please login again.");
        return;
      }

      const res = await fetch("/api/admin/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminId,
          email: adminEmail,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert("Account updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        if (newPassword) {
          // Optional: Logout user if password changed
        }
      } else {
        alert(data.error || "Failed to update account");
      }
    } catch (error) {
      alert("Error updating account");
    } finally {
      setSavingAccount(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading settings...</div>;

  return (
    <div className="p-6 md:p-8 text-white max-w-7xl mx-auto space-y-8">
      <h1 className="text-3xl font-heading font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-turf-neon to-white">
        Platform Settings
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: BRANDING */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="text-turf-neon" size={24} />
            <h2 className="text-xl font-bold font-heading text-white">
              Identity & Branding
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass h-full">
            <form onSubmit={handleSaveBranding} className="space-y-6">
              {/* Company Name */}
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-neon focus:ring-1 focus:ring-turf-neon transition-all"
                  placeholder="Enter company name"
                />
              </div>

              {/* Support Email */}
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                  Public Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-neon focus:ring-1 focus:ring-turf-neon transition-all"
                  placeholder="support@example.com"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-4">
                <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                  Company Logo
                </label>

                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden relative">
                      {previewUrl || logoUrl ? (
                        <Image
                          src={previewUrl || logoUrl || ""}
                          alt="Logo"
                          fill
                          className="object-contain p-2"
                        />
                      ) : (
                        <span className="text-2xl text-gray-600 font-bold">
                          {companyName.charAt(0)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <input
                      type="file"
                      id="logo-upload"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg cursor-pointer transition-all text-sm font-medium"
                    >
                      <Upload size={16} className="text-turf-neon" />
                      Upload New
                    </label>
                    <p className="mt-2 text-xs text-gray-500">
                      PNG/SVG, Transparent bg recommended.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingBranding}
                  className="px-6 py-2.5 bg-turf-neon text-turf-dark font-bold rounded-xl hover:shadow-neon-green transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingBranding ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Branding
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: ACCOUNT */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-turf-blue" size={24} />
            <h2 className="text-xl font-bold font-heading text-white">
              Admin Account
            </h2>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass h-full">
            <form onSubmit={handleSaveAccount} className="space-y-6">
              <div className="p-4 bg-turf-blue/10 border border-turf-blue/20 rounded-xl mb-6">
                <p className="text-sm text-turf-blue mb-1 font-bold">
                  Authenticated User
                </p>
                <p className="text-white opacity-80 text-sm break-all">
                  {adminEmail || "Loading..."}
                </p>
              </div>

              {/* Login Email */}
              <div className="space-y-2">
                <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                  Login Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-blue focus:ring-1 focus:ring-turf-blue transition-all"
                  placeholder="admin@turf.com"
                />
              </div>

              {/* Password Section */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <h3 className="text-turf-blue font-bold text-sm uppercase tracking-wide">
                  Change Password
                </h3>

                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-blue focus:ring-1 focus:ring-turf-blue transition-all"
                    placeholder="Required to save changes"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-blue focus:ring-1 focus:ring-turf-blue transition-all"
                      placeholder="Leave blank to keep current"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider text-gray-500 font-bold">
                      Confirm New
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-blue focus:ring-1 focus:ring-turf-blue transition-all"
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingAccount}
                  className="px-6 py-2.5 bg-turf-blue text-white font-bold rounded-xl hover:shadow-lg hover:shadow-turf-blue/20 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {savingAccount ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update Account
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
