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
import { PremiumToggle } from "@/components/ui/bouncy-toggle";
import { NumberInput } from "@/components/ui/number-input";
import { ChevronLeft, X, UploadCloud, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import { useRouter, useSearchParams } from "next/navigation";
import { siteConfig } from "@/lib/config";
import { Turf } from "@/types/turf";
import { useTurf, useUpdateTurf } from "@/hooks/use-turfs";
import { useUploadFile } from "@/hooks/use-storage";
import { generateTimeSlots } from "@/lib/convertTime";
import { cn } from "@/lib/utils";

interface FileWithPreview extends File {
  preview: string;
}

const EditTurf = () => {
  const searchParams = useSearchParams();
  const turfId = searchParams.get("id");
  const { data: existingTurf, isLoading: isTurfLoading } = useTurf(
    turfId || ""
  );
  const updateTurfMutation = useUpdateTurf();
  const uploadFileMutation = useUploadFile();

  const router = useRouter();

  // Initialize with empty object, will be populated by useEffect
  const [newTurf, setNewTurf] = useState<Turf | null>(null);
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);

  // Toggle State
  const [enabled, setEnabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [pendingState, setPendingState] = useState<null | boolean>(null);

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

  useEffect(() => {
    if (existingTurf) {
      setNewTurf(existingTurf);
      setEnabled(existingTurf.isDisabled || false);
    }
  }, [existingTurf]);

  if (isTurfLoading) {
    return (
      <div className="p-20 text-center text-white">
        Loading Arena Details...
      </div>
    );
  }

  if (!newTurf && !isTurfLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Arena Not Found</h2>
        <p className="text-gray-400 mb-6">
          The arena you are trying to edit does not exist or has been removed.
        </p>
        <NeonButton onClick={() => router.push("/admin/turfs")}>
          Back to Arenas
        </NeonButton>
      </div>
    );
  }

  if (!newTurf) return null;

  // Handlers
  const handleToggle = (checked: boolean) => {
    if (checked) {
      setPendingState(true);
      setShowDialog(true);
    } else {
      setEnabled(false);
      if (newTurf) {
        setNewTurf({
          ...newTurf,
          isDisabled: false,
          disabledReason: "",
        });
      }
    }
  };

  const handleConfirm = () => {
    const reasonToSave =
      selectedReason === "Custom Reason" ? customReason : selectedReason;
    setEnabled(true);
    setShowDialog(false);
    if (newTurf) {
      setNewTurf({
        ...newTurf,
        isDisabled: true,
        disabledReason: reasonToSave,
      });
    }
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

  const removeFile = (file: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const validateClosingTime = (closingTime: string) => {
    if (!newTurf) return true;
    try {
      const openingDate = parse(newTurf.openingTime, "HH:mm:ss", new Date());
      const closingDate = parse(closingTime, "HH:mm:ss", new Date());
      return isAfter(closingDate, openingDate);
    } catch (e) {
      return true;
    }
  };

  const timeSlots = newTurf
    ? generateTimeSlots(newTurf.slotInterval || 60)
    : [];

  const handleUpdateTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTurf || !turfId) return;

    setLoading(true);

    try {
      let imageUrl = newTurf.imageUrl;
      if (files.length > 0) {
        try {
          const { url } = await uploadFileMutation.mutateAsync({
            bucket: "turf-images",
            file: files[0],
          });
          imageUrl = url;
        } catch (err: any) {
          toast.error(err.message || "Failed to upload image");
          setLoading(false);
          return;
        }
      }

      const formattedTurf = {
        ...newTurf,
        imageUrl: imageUrl,
        pricePerHour: String(newTurf.pricePerHour || "0"),

        // Sanitize optional time fields
        weekdayMorningStart: newTurf.weekdayMorningStart || undefined,
        weekdayEveningStart: newTurf.weekdayEveningStart || undefined,
        weekendMorningStart: newTurf.weekendMorningStart || undefined,
        weekendEveningStart: newTurf.weekendEveningStart || undefined,
      };

      // Strip immutable fields
      const { id, createdAt, ...updateData } = formattedTurf;

      await updateTurfMutation.mutateAsync({ id: turfId, data: updateData });
      toast.success("Turf updated successfully");
      router.push("/admin/turfs");
    } catch (error: any) {
      toast.error("Error updating turf: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    "bg-white/5 border-white/10 text-white !text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-1 focus:ring-turf-neon/20 rounded-xl";
  const labelClasses = "text-gray-300 font-medium mb-1.5 block";

  // Helper to extract time HH:mm:ss from timestamp or return time string
  const getTimeString = (timeStr: string | null) => {
    if (!timeStr) return "";
    if (timeStr.includes(" ")) {
      return timeStr.split(" ")[1];
    }
    return timeStr;
  };

  const formatTo12Hour = (timeStr: string | undefined) => {
    if (!timeStr) return undefined;
    const [hours, minutes] = timeStr.split(":");
    if (!hours || !minutes) return timeStr; // Fallback
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

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
            Edit Arena
          </h1>
          <p className="text-gray-400">
            Modify details, pricing, and availability for {newTurf.name}.
          </p>
        </div>
      </div>

      <form onSubmit={handleUpdateTurf} className="space-y-8">
        <GlassCard title="Basic Details" className="overflow-visible">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="space-y-1">
              <Label className={labelClasses}>Arena Name</Label>
              <Input
                placeholder="e.g. Neon Soccer Arena"
                value={newTurf.name}
                onChange={(e) =>
                  setNewTurf((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
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
                  setNewTurf((prev) =>
                    prev ? { ...prev, type: e.target.value } : null
                  )
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
                  setNewTurf((prev) =>
                    prev ? { ...prev, location: e.target.value } : null
                  )
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
                <NumberInput
                  value={Number(newTurf.pricePerHour)}
                  onChange={(val) =>
                    setNewTurf((prev) =>
                      prev ? { ...prev, pricePerHour: String(val) } : null
                    )
                  }
                  step={100}
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
                  setNewTurf((prev) =>
                    prev ? { ...prev, description: e.target.value } : null
                  )
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
              <NumberInput
                value={newTurf.maxPlayers}
                onChange={(val) =>
                  setNewTurf((prev) =>
                    prev ? { ...prev, maxPlayers: val } : null
                  )
                }
                min={1}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClasses}>Min Duration (Hours)</Label>
              <NumberInput
                value={newTurf.minHours}
                onChange={(val) =>
                  setNewTurf((prev) =>
                    prev ? { ...prev, minHours: val } : null
                  )
                }
                min={1}
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <Label className={labelClasses}>Max Duration (Hours)</Label>
              <NumberInput
                value={newTurf.maxHours}
                onChange={(val) =>
                  setNewTurf((prev) =>
                    prev ? { ...prev, maxHours: val } : null
                  )
                }
                min={1}
                className={inputClasses}
              />
            </div>

            <div className="space-y-1 md:col-span-3 pt-4 border-t border-white/10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-1">
                  <Label className={labelClasses}>Slot Interval</Label>
                  <Select
                    value={newTurf.slotInterval?.toString() || undefined}
                    onValueChange={(value) =>
                      setNewTurf((prev) =>
                        prev ? { ...prev, slotInterval: parseInt(value) } : null
                      )
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

                {newTurf.slotInterval && (
                  <>
                    <div className="flex-1 space-y-1">
                      <Label className={labelClasses}>Opening Time</Label>
                      <div className={cn("p-1 rounded-xl", inputClasses)}>
                        <TimePicker
                          interval={newTurf.slotInterval}
                          defaultValue={getTimeString(newTurf.openingTime)}
                          onChange={(e) =>
                            setNewTurf((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    openingTime: e.target.value,
                                  }
                                : null
                            )
                          }
                        />
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <Label className={labelClasses}>Closing Time</Label>
                      <div className={cn("p-1 rounded-xl", inputClasses)}>
                        <TimePicker
                          disabled={!newTurf.openingTime}
                          interval={newTurf.slotInterval}
                          startTime={getTimeString(newTurf.openingTime)}
                          defaultValue={getTimeString(newTurf.closingTime)}
                          onChange={(e) =>
                            setNewTurf((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    closingTime: e.target.value,
                                  }
                                : null
                            )
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
            {files.length === 0 && !newTurf.imageUrl ? (
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
                  src={files[0]?.preview || newTurf.imageUrl || undefined}
                  alt="Turf Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <NeonButton
                    variant="danger"
                    type="button"
                    onClick={() => {
                      setFiles([]);
                      setNewTurf({ ...newTurf, imageUrl: "" });
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
                <PremiumToggle
                  // id="enable_weekday" - PremiumToggle doesn't expose ID but it's fine for now, label handles click
                  checked={newTurf.isWeekdayPricingEnabled || false}
                  onChange={(checked) =>
                    setNewTurf((prev) =>
                      prev
                        ? { ...prev, isWeekdayPricingEnabled: checked }
                        : null
                    )
                  }
                />
              </div>
            </div>
          }
          className="overflow-visible"
        >
          {newTurf.isWeekdayPricingEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Morning Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={
                        newTurf.weekdayMorningStart?.slice(0, 5) || undefined
                      }
                      onValueChange={(val) =>
                        setNewTurf((prev) =>
                          prev ? { ...prev, weekdayMorningStart: val } : null
                        )
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <div className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-white flex-1">
                            {formatTo12Hour(
                              newTurf.weekdayMorningStart?.slice(0, 5)
                            ) || "Select Time"}
                          </span>
                        </div>
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
                    <NumberInput
                      value={Number(newTurf.weekdayMorningPrice) || 0}
                      onChange={(val) =>
                        setNewTurf((prev) =>
                          prev
                            ? {
                                ...prev,
                                weekdayMorningPrice: String(val),
                              }
                            : null
                        )
                      }
                      min={0}
                      step={100}
                      className={inputClasses}
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
                      value={
                        newTurf.weekdayEveningStart?.slice(0, 5) || undefined
                      }
                      onValueChange={(val) =>
                        setNewTurf((prev) =>
                          prev ? { ...prev, weekdayEveningStart: val } : null
                        )
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <div className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-white flex-1">
                            {formatTo12Hour(
                              newTurf.weekdayEveningStart?.slice(0, 5)
                            ) || "Select Time"}
                          </span>
                        </div>
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
                    <NumberInput
                      value={Number(newTurf.weekdayEveningPrice) || 0}
                      onChange={(val) =>
                        setNewTurf((prev) =>
                          prev
                            ? {
                                ...prev,
                                weekdayEveningPrice: String(val),
                              }
                            : null
                        )
                      }
                      min={0}
                      step={100}
                      className={inputClasses}
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
                <PremiumToggle
                  // id="enable_weekend"
                  checked={newTurf.isWeekendPricingEnabled || false}
                  onChange={(checked) =>
                    setNewTurf((prev) =>
                      prev
                        ? { ...prev, isWeekendPricingEnabled: checked }
                        : null
                    )
                  }
                />
              </div>
            </div>
          }
          className="overflow-visible"
        >
          {newTurf.isWeekendPricingEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-4 p-4 rounded-xl bg-white/5 border border-white/5">
                <h4 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
                  Morning Slots
                </h4>
                <div className="space-y-3">
                  <div>
                    <Label className={labelClasses}>Start Time</Label>
                    <Select
                      value={
                        newTurf.weekendMorningStart?.slice(0, 5) || undefined
                      }
                      onValueChange={(val) =>
                        setNewTurf((prev) =>
                          prev ? { ...prev, weekendMorningStart: val } : null
                        )
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <div className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-white flex-1">
                            {formatTo12Hour(
                              newTurf.weekendMorningStart?.slice(0, 5)
                            ) || "Select Time"}
                          </span>
                        </div>
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
                    <NumberInput
                      value={Number(newTurf.weekendMorningPrice) || 0}
                      onChange={(val) =>
                        setNewTurf((prev) =>
                          prev
                            ? {
                                ...prev,
                                weekendMorningPrice: String(val),
                              }
                            : null
                        )
                      }
                      min={0}
                      step={100}
                      className={inputClasses}
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
                      value={
                        newTurf.weekendEveningStart?.slice(0, 5) || undefined
                      }
                      onValueChange={(val) =>
                        setNewTurf((prev) =>
                          prev ? { ...prev, weekendEveningStart: val } : null
                        )
                      }
                    >
                      <SelectTrigger className={inputClasses}>
                        <div className="flex items-center gap-2 flex-1 text-left">
                          <span className="text-white flex-1">
                            {formatTo12Hour(
                              newTurf.weekendEveningStart?.slice(0, 5)
                            ) || "Select Time"}
                          </span>
                        </div>
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
                    <NumberInput
                      value={Number(newTurf.weekendEveningPrice) || 0}
                      onChange={(val) =>
                        setNewTurf((prev) =>
                          prev
                            ? {
                                ...prev,
                                weekendEveningPrice: String(val),
                              }
                            : null
                        )
                      }
                      className={inputClasses}
                      min={0}
                      step={100}
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
          <PremiumToggle checked={enabled} onChange={handleToggle} />
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
            {loading ? "Updating..." : "Update Arena"}
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

export default EditTurf;
