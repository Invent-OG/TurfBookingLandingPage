"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Upload,
  Loader2,
  Save,
  Megaphone,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export default function OffersPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Offer State
  const [isPromoPopupActive, setIsPromoPopupActive] = useState(false);
  const [promoPopupImage, setPromoPopupImage] = useState<string | null>(null);
  const [selectedPromoFile, setSelectedPromoFile] = useState<File | null>(null);
  const [promoPreviewUrl, setPromoPreviewUrl] = useState<string | null>(null);

  // New Fields
  const [promoTitle, setPromoTitle] = useState("");
  const [promoDescription, setPromoDescription] = useState("");
  const [promoButtonText, setPromoButtonText] = useState("");
  const [promoButtonLink, setPromoButtonLink] = useState("");
  const [isPromoButtonActive, setIsPromoButtonActive] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        setPromoPopupImage(data.promoPopupImage);
        setIsPromoPopupActive(data.isPromoPopupActive || false);
        setPromoTitle(data.promoTitle || "");
        setPromoDescription(data.promoDescription || "");
        setPromoButtonText(data.promoButtonText || "");
        setPromoButtonLink(data.promoButtonLink || "");
        setIsPromoButtonActive(data.isPromoButtonActive || false);
      }
    } catch (error) {
      console.error("Failed to load settings");
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPromoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPromoPreviewUrl(objectUrl);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("isPromoPopupActive", String(isPromoPopupActive));
      formData.append("promoTitle", promoTitle);
      formData.append("promoDescription", promoDescription);
      formData.append("promoButtonText", promoButtonText);
      formData.append("promoButtonLink", promoButtonLink);
      formData.append("isPromoButtonActive", String(isPromoButtonActive));

      if (selectedPromoFile) {
        let uploadPromo = selectedPromoFile;
        // Compress if image
        if (selectedPromoFile.type.startsWith("image/")) {
          try {
            const options = {
              maxSizeMB: 2,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            uploadPromo = await imageCompression(selectedPromoFile, options);
          } catch (error) {
            console.warn("Promo compression failed:", error);
          }
        }
        formData.append("promoImage", uploadPromo);
      }

      const res = await fetch("/api/admin/settings", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const updated = await res.json();
        setPromoPopupImage(updated.promoPopupImage);

        setPromoPreviewUrl(null);
        setSelectedPromoFile(null);

        toast.success("Offer settings updated!");
        // Optional: reload to ensure comprehensive state sync
        // window.location.reload();
      } else {
        const data = await res.json();
        toast.error(`Failed: ${data.details || data.error}`);
      }
    } catch (error) {
      toast.error("Error saving offer settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-turf-neon" size={32} />
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-turf-neon/10 rounded-xl border border-turf-neon/20">
          <Megaphone className="text-turf-neon" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-heading text-white">
            Promotional Offer
          </h1>
          <p className="text-white/60 text-sm">
            Manage the popup offer displayed to visitors
          </p>
        </div>
      </div>

      <div className="max-w-4xl">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-glass">
          <form onSubmit={handleSave} className="space-y-8">
            {/* Activation Switch */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <h3 className="font-bold text-white mb-1">Active Offer</h3>
                <p className="text-sm text-gray-400">
                  Show this offer popup on site load
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isPromoPopupActive}
                    onChange={(e) => setIsPromoPopupActive(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-turf-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-turf-neon"></div>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* LEFT COLUMN: Image */}
              <div className="space-y-4">
                <label className="text-sm uppercase tracking-wider text-gray-400 font-bold block">
                  Offer Image
                </label>

                <div className="flex flex-col gap-4">
                  {promoPreviewUrl || promoPopupImage ? (
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                      <Image
                        src={promoPreviewUrl || promoPopupImage || ""}
                        alt="Promo Offer"
                        fill
                        className="object-contain"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label
                          htmlFor="promo-upload"
                          className="px-4 py-2 bg-white text-black font-bold rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center gap-2"
                        >
                          <Upload size={16} />
                          Change Image
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[4/5] rounded-xl bg-black/40 border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 p-6 text-gray-500 hover:border-turf-neon/50 hover:bg-white/5 transition-all">
                      <Upload size={32} className="text-gray-600" />
                      <div className="text-center">
                        <p className="text-white font-medium">Upload Image</p>
                        <p className="text-xs mt-1">
                          Recommended: Vertical (800x1000px)
                        </p>
                      </div>
                      <label
                        htmlFor="promo-upload"
                        className="mt-2 px-4 py-2 bg-white/10 border border-white/10 rounded-lg text-white hover:bg-white/20 transition-colors cursor-pointer text-sm"
                      >
                        Select File
                      </label>
                    </div>
                  )}

                  <input
                    type="file"
                    id="promo-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePromoFileChange}
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: Content */}
              <div className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                    Offer Title{" "}
                    <span className="text-xs normal-case opacity-50">
                      (Optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-neon focus:ring-1 focus:ring-turf-neon transition-all placeholder:text-white/20"
                    placeholder="e.g. Summer Sale!"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm uppercase tracking-wider text-gray-400 font-bold">
                    Description{" "}
                    <span className="text-xs normal-case opacity-50">
                      (Optional)
                    </span>
                  </label>
                  <textarea
                    value={promoDescription}
                    onChange={(e) => setPromoDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-turf-neon focus:ring-1 focus:ring-turf-neon transition-all resize-none placeholder:text-white/20"
                    placeholder="Get 20% off on all weekend bookings..."
                  />
                </div>

                {/* CTA Button Section */}
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm uppercase tracking-wider text-gray-400 font-bold flex items-center gap-2">
                      <ExternalLink size={16} />
                      Call to Action Button
                    </label>

                    <label className="relative inline-flex items-center cursor-pointer scale-90">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={isPromoButtonActive}
                        onChange={(e) =>
                          setIsPromoButtonActive(e.target.checked)
                        }
                      />
                      <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-turf-neon rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-turf-neon"></div>
                    </label>
                  </div>

                  <div
                    className={`space-y-4 transition-all duration-300 ${isPromoButtonActive ? "opacity-100" : "opacity-30 pointer-events-none"}`}
                  >
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">
                        Button Text
                      </label>
                      <input
                        type="text"
                        value={promoButtonText}
                        onChange={(e) => setPromoButtonText(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-neon transition-all"
                        placeholder="Book Now"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500">
                        Button Link (URL)
                      </label>
                      <input
                        type="text"
                        value={promoButtonLink}
                        onChange={(e) => setPromoButtonLink(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-turf-neon transition-all"
                        placeholder="/booking or https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-turf-neon text-black font-bold rounded-xl hover:shadow-neon-green transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Save Offer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
