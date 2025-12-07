"use client";
import { TimePicker } from "@/components/admin/turf/TimePicker";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ChevronLeft, X, UploadCloud, AlertTriangle } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isAfter, parse } from "date-fns";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/config";
import { Turf } from "@/types/turf";
import { generateTimeSlots } from "@/lib/convertTime";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview: string;
}

const CreateNewTurf = () => {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);

  // Turf State
  const [newTurf, setNewTurf] = useState<Omit<Turf, "id">>({
    name: "",
    description: "",
    location: "",
    type: "",
    price_per_hour: "",
    is_weekday_pricing_enabled: false,
    weekday_morning_start: "",
    weekday_evening_start: "",
    weekday_morning_price: "",
    weekday_evening_price: "",
    is_weekend_pricing_enabled: false,
    weekend_morning_start: "",
    weekend_evening_start: "",
    weekend_morning_price: "",
    weekend_evening_price: "",
    slot_interval: "",
    opening_time: "",
    closing_time: "",
    max_players: "",
    max_hours: "",
    min_hours: "",
    is_disabled: false,
    disabled_reason: "",
    image_url: "",
  });

  // Toggle State
  const [enabled, setEnabled] = useState(newTurf?.is_disabled);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [pendingState, setPendingState] = useState<null | boolean>(null);

  const router = useRouter();

  // Handlers
  const handleToggle = (checked: boolean) => {
    if (checked) {
      setPendingState(true);
      setShowDialog(true);
    } else {
      setEnabled(false);
      setNewTurf({
        ...newTurf,
        is_disabled: false,
        disabled_reason: "",
      });
    }
  };

  const handleConfirm = () => {
    const reasonToSave =
      selectedReason === "Custom Reason" ? customReason : selectedReason;
    setEnabled(true);
    setShowDialog(false);
    setNewTurf({
      ...newTurf,
      is_disabled: true,
      disabled_reason: reasonToSave,
    });
    setSelectedReason("");
    setCustomReason("");
    setPendingState(null);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPendingState(null);
    setSelectedReason("");
    setCustomReason("");
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    onDrop: (acceptedFiles: File[]) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setFiles(filesWithPreview);
    },
  });

  const removeFile = (file: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const validateClosingTime = (closingTime: string) => {
    try {
      const openingDate = parse(newTurf.opening_time, "HH:mm:ss", new Date());
      const closingDate = parse(closingTime, "HH:mm:ss", new Date());
      return isAfter(closingDate, openingDate);
    } catch (e) {
      return true;
    }
  };

  const timeSlots = generateTimeSlots(parseInt(newTurf.slot_interval) || 60);

  const handleAddTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = newTurf.image_url;

      if (files[0]) {
        const fileName = `turf-${Date.now()}-${files[0].name}`;
        const { data, error } = await supabase.storage
          .from("turf-images")
          .upload(fileName, files[0], {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) throw error;
        imageUrl = supabase.storage.from("turf-images").getPublicUrl(data.path)
          .data.publicUrl;
      }

      const formattedTurf = {
        ...newTurf,
        opening_time: newTurf.opening_time
          ? `1970-01-01 ${newTurf.opening_time}`
          : null,
        closing_time: newTurf.closing_time
          ? `1970-01-01 ${newTurf.closing_time}`
          : null,
        image_url: imageUrl,
        price_per_hour: newTurf.price_per_hour || "0",
        max_players: newTurf.max_players || "0",
        max_hours: newTurf.max_hours || "0",
        min_hours: newTurf.min_hours || "0",
        weekday_morning_price: newTurf.weekday_morning_price || "0",
        weekday_evening_price: newTurf.weekday_evening_price || "0",
        weekend_morning_price: newTurf.weekend_morning_price || "0",
        weekend_evening_price: newTurf.weekend_evening_price || "0",
        weekday_morning_start: newTurf.weekday_morning_start || "00:00:00",
        weekday_evening_start: newTurf.weekday_evening_start || "00:00:00",
        weekend_morning_start: newTurf.weekend_morning_start || "00:00:00",
        weekend_evening_start: newTurf.weekend_evening_start || "00:00:00",
      };

      await supabase.from("turfs").insert([formattedTurf]);
      toast.success("Turf added successfully");
      router.push("/admin/turfs");
    } catch (error: any) {
      toast.error("Error saving turf: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white !text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex items-center gap-4 mb-8">
        <NeonButton
          variant="ghost"
          onClick={() => router.back()}
          className="rounded-full p-2 h-10 w-10"
        >
          <ChevronLeft className="w-6 h-6" />
        </NeonButton>
        <div>
          <h1 className="text-3xl font-bold text-white font-heading">
            Add New Arena
          </h1>
          <p className="text-gray-400">
            Configure details, pricing, and availability for your turf.
          </p>
        </div>
      </div>

      <form onSubmit={handleAddTurf} className="space-y-8">
        <GlassCard title="Basic Details" className="overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1">
              <Label className={labelClasses}>Arena Name</Label>
              <Input
                placeholder="e.g. Neon Soccer Arena"
                value={newTurf.name}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, name: e.target.value })
                }
                required
                className={inputClasses}
              />
            </div>
            {/* Type */}
            <div className="space-y-1">
              <Label className={labelClasses}>Sport Type</Label>
              <Input
                placeholder="e.g. Football 5v5"
                value={newTurf.type}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, type: e.target.value })
                }
                required
                className={inputClasses}
              />
            </div>
            {/* Location */}
            <div className="space-y-1">
              <Label className={labelClasses}>Location</Label>
              <Input
                placeholder="e.g. Downtown Sports Complex"
                value={newTurf.location}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, location: e.target.value })
                }
                required
                className={inputClasses}
              />
            </div>
            {/* Price */}
            <div className="space-y-1">
              <Label className={labelClasses}>Base Price (Per Hour)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  ₹
                </span>
                <Input
                  type="number"
                  placeholder="0"
                  value={newTurf.price_per_hour}
                  onChange={(e) =>
                    setNewTurf({ ...newTurf, price_per_hour: e.target.value })
                  }
                  required
                  min={0}
                  className={cn(inputClasses, "pl-7")}
                />
              </div>
            </div>
            {/* Description */}
            <div className="md:col-span-2 space-y-1">
              <Label className={labelClasses}>Description</Label>
              <Textarea
                placeholder="Describe the arena amenities, surface type, etc."
                value={newTurf.description}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, description: e.target.value })
                }
                required
                className={cn(inputClasses, "min-h-[100px]")}
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Availability & Rules" className="overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <Label className={labelClasses}>Max Players</Label>
              <Input
                type="number"
                placeholder="10"
                value={newTurf.max_players}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, max_players: e.target.value })
                }
                required
                min={1}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClasses}>Min Duration (Hours)</Label>
              <Input
                type="number"
                placeholder="1"
                value={newTurf.min_hours}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, min_hours: e.target.value })
                }
                required
                min={1}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClasses}>Max Duration (Hours)</Label>
              <Input
                type="number"
                placeholder="3"
                value={newTurf.max_hours}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, max_hours: e.target.value })
                }
                required
                min={1}
                className={inputClasses}
              />
            </div>

            <div className="space-y-1 md:col-span-3 pt-4 border-t border-white/10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-1">
                  <Label className={labelClasses}>Slot Interval</Label>
                  <Select
                    value={newTurf.slot_interval || undefined}
                    onValueChange={(value) =>
                      setNewTurf({ ...newTurf, slot_interval: value })
                    }
                  >
                    <SelectTrigger className={inputClasses}>
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent className="bg-black border border-white/10 text-white z-[9999] overflow-y-auto">
                      {siteConfig.slotIntervals.map((slot) => (
                        <SelectItem
                          key={slot.value}
                          value={slot.value}
                          className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
                        >
                          {slot.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newTurf.slot_interval && (
                  <>
                    <div className="flex-1 space-y-1">
                      <Label className={labelClasses}>Opening Time</Label>
                      <div className={cn("p-1 rounded-xl", inputClasses)}>
                        <TimePicker
                          interval={parseInt(newTurf.slot_interval)}
                          defaultValue={newTurf.opening_time}
                          onChange={(e) =>
                            setNewTurf({
                              ...newTurf,
                              opening_time: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className={labelClasses}>Closing Time</Label>
                      <div className={cn("p-1 rounded-xl", inputClasses)}>
                        <TimePicker
                          disabled={!newTurf.opening_time}
                          interval={parseInt(newTurf.slot_interval)}
                          startTime={newTurf.opening_time}
                          defaultValue={newTurf.closing_time}
                          onChange={(e) =>
                            setNewTurf({
                              ...newTurf,
                              closing_time: e.target.value,
                            })
                          }
                          validate={validateClosingTime}
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Image Upload */}
        <GlassCard title="Arena Image" className="overflow-visible">
          <div className="w-full">
            {files.length === 0 && !newTurf.image_url ? (
              <div
                {...getRootProps()}
                className="border-2 border-dashed border-white/20 rounded-2xl p-10 text-center cursor-pointer hover:bg-white/5 hover:border-turf-neon/50 transition-all flex flex-col items-center gap-3 group"
              >
                <input {...getInputProps()} />
                <div className="p-4 rounded-full bg-white/5 text-turf-neon group-hover:bg-turf-neon group-hover:text-turf-dark transition-colors">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-white font-medium text-lg">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    SVG, PNG, JPG or GIF (max. 800x400px)
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-64 rounded-2xl overflow-hidden group border border-white/10">
                <img
                  src={files[0]?.preview || newTurf.image_url}
                  alt="Turf Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <NeonButton
                    variant="danger"
                    type="button"
                    onClick={() => {
                      setFiles([]);
                      setNewTurf({ ...newTurf, image_url: "" });
                    }}
                  >
                    <X className="w-4 h-4 mr-2" /> Remove Image
                  </NeonButton>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Pricing Options */}
        <GlassCard
          title={
            <div className="flex items-center justify-between w-full">
              <span>Weekday Pricing</span>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="enable_weekday"
                  className="text-sm font-normal text-gray-400 mb-0"
                >
                  Enable Dynamic Pricing
                </Label>
                <Switch
                  id="enable_weekday"
                  checked={newTurf.is_weekday_pricing_enabled}
                  onCheckedChange={(e) =>
                    setNewTurf({ ...newTurf, is_weekday_pricing_enabled: e })
                  }
                />
              </div>
            </div>
          }
          className="overflow-visible"
        >
          {newTurf.is_weekday_pricing_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Morning Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={newTurf.weekday_morning_start || undefined}
                      onValueChange={(val) =>
                        setNewTurf({ ...newTurf, weekday_morning_start: val })
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-white/10 text-white max-h-60 z-[9999] overflow-y-auto">
                        {siteConfig.morningTimes.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
                          >
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelClasses}>Price</Label>
                    <Input
                      type="number"
                      className={inputClasses}
                      placeholder="0"
                      value={newTurf.weekday_morning_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekday_morning_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Evening Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={newTurf.weekday_evening_start || undefined}
                      onValueChange={(val) =>
                        setNewTurf({ ...newTurf, weekday_evening_start: val })
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-white/10 text-white max-h-60 z-[9999] overflow-y-auto">
                        {siteConfig.eveningTimes.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
                          >
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelClasses}>Price</Label>
                    <Input
                      type="number"
                      className={inputClasses}
                      placeholder="0"
                      value={newTurf.weekday_evening_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekday_evening_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        <GlassCard
          title={
            <div className="flex items-center justify-between w-full">
              <span>Weekend Pricing</span>
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="enable_weekend"
                  className="text-sm font-normal text-gray-400 mb-0"
                >
                  Enable Dynamic Pricing
                </Label>
                <Switch
                  id="enable_weekend"
                  checked={newTurf.is_weekend_pricing_enabled}
                  onCheckedChange={(e) =>
                    setNewTurf({ ...newTurf, is_weekend_pricing_enabled: e })
                  }
                />
              </div>
            </div>
          }
          className="overflow-visible"
        >
          {newTurf.is_weekend_pricing_enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Morning Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={newTurf.weekend_morning_start || undefined}
                      onValueChange={(val) =>
                        setNewTurf({ ...newTurf, weekend_morning_start: val })
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-white/10 text-white max-h-60 z-[9999] overflow-y-auto">
                        {siteConfig.morningTimes.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
                          >
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelClasses}>Price</Label>
                    <Input
                      type="number"
                      className={inputClasses}
                      placeholder="0"
                      value={newTurf.weekend_morning_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_morning_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Evening Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={newTurf.weekend_evening_start || undefined}
                      onValueChange={(val) =>
                        setNewTurf({ ...newTurf, weekend_evening_start: val })
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <SelectValue placeholder="Select Time" />
                      </SelectTrigger>
                      <SelectContent className="bg-black border border-white/10 text-white max-h-60 z-[9999] overflow-y-auto">
                        {siteConfig.eveningTimes.map((t) => (
                          <SelectItem
                            key={t}
                            value={t}
                            className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer pl-8"
                          >
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className={labelClasses}>Price</Label>
                    <Input
                      type="number"
                      className={inputClasses}
                      placeholder="0"
                      value={newTurf.weekend_evening_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_evening_price: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Disable Turf Section */}
        <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/10 border border-red-500/20">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-red-500/20 text-red-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Temporary Disabling
              </h3>
              <p className="text-sm text-gray-400">
                Prevent new bookings without deleting the turf.
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>

        <div className="flex gap-4 pt-4">
          <NeonButton
            variant="ghost"
            type="button"
            onClick={() => router.back()}
            className="flex-1"
          >
            Cancel
          </NeonButton>
          <NeonButton
            variant="primary"
            type="submit"
            disabled={loading}
            className="flex-[2]"
            glow
          >
            {loading ? "Creating Arena..." : "Create Arena"}
          </NeonButton>
        </div>

        {/* Disable Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="bg-turf-dark border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle>Reason for Disabling</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Reason</Label>
                <Select
                  onValueChange={setSelectedReason}
                  value={selectedReason}
                >
                  <SelectTrigger className={inputClasses}>
                    <SelectValue placeholder="Select a reason" />
                  </SelectTrigger>
                  <SelectContent className="bg-turf-dark border-white/10 text-white">
                    {siteConfig.disableReasons.map((r, i) => (
                      <SelectItem
                        key={i}
                        value={r}
                        className="text-white hover:bg-turf-neon hover:text-turf-dark focus:bg-turf-neon focus:text-turf-dark cursor-pointer"
                      >
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedReason === "Custom Reason" && (
                <div className="space-y-2">
                  <Label>Custom Reason</Label>
                  <Input
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className={inputClasses}
                    placeholder="Enter reason..."
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <NeonButton variant="ghost" onClick={handleCancel}>
                Cancel
              </NeonButton>
              <NeonButton
                disabled={
                  !selectedReason ||
                  (selectedReason === "Custom Reason" && !customReason.trim())
                }
                onClick={handleConfirm}
              >
                Confirm Disable
              </NeonButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
};

export default CreateNewTurf;
