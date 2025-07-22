"use client";
import { TimePicker } from "@/components/admin/turf/TimePicker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { ChevronLeft, Loader2, X } from "lucide-react";
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
import { supabase } from "@/lib/supabase";
import { siteConfig } from "@/lib/config";
import { Turf } from "@/types/turf";
import { useTurfStore } from "@/lib/store/turf";
import {
  formatTo24Hour,
  formatToAMPM,
  generateTimeSlots,
} from "@/lib/convertTime";

interface FileWithPreview extends File {
  preview: string;
}

const CreateNewTurf = () => {
  const searchParams = useSearchParams();

  const turfId = searchParams.get("id"); // Get ID from URL query params

  const { turfs } = useTurfStore();

  const existingTurf = turfs.find((t) => t.id === turfId);

  const [newTurf, setNewTurf] = useState<Turf | null>(existingTurf || null);

  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const [error, setError] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const [enabled, setEnabled] = useState(newTurf?.is_disabled); // Turf is disabled by default
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [pendingState, setPendingState] = useState<null | boolean>(null); //

  useEffect(() => {
    if (existingTurf) {
      setNewTurf(existingTurf);
    }
  }, [existingTurf]);

  console.log("Existing Turf:", newTurf);

  if (!newTurf) {
    return <p className="text-center text-red-500">Turf not found!</p>;
  }

  const handleToggle = (checked: boolean) => {
    if (checked) {
      // Ask reason only when enabling
      setPendingState(true);
      setShowDialog(true);
    } else {
      // Disable immediately
      setEnabled(false);
      console.log("Turf disabled");
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
    // Save reason to backend or state
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPendingState(null);
    setSelectedReason("");
    setCustomReason("");
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/*": [] },
    onDrop: (acceptedFiles: File[]) => {
      const filesWithPreview = acceptedFiles.map((file) =>
        Object.assign(file, { preview: URL.createObjectURL(file) })
      );
      setFiles((prevFiles) => [...prevFiles, ...filesWithPreview]);
    },
  });

  const removeFile = (file: FileWithPreview) => {
    setFiles((prevFiles) => prevFiles.filter((f) => f !== file));
    URL.revokeObjectURL(file.preview);
  };

  const validateClosingTime = (closingTime: string) => {
    const openingDate = parse(newTurf.opening_time, "HH:mm:ss", new Date());
    const closingDate = parse(closingTime, "HH:mm:ss", new Date());
    return isAfter(closingDate, openingDate);
  };

  const timeSlots = generateTimeSlots(parseInt(newTurf.slot_interval));
  // Helper function to filter valid times
  const filterTimeOptions = (start: any, end: any) => {
    return timeSlots.filter((time) => {
      const timeValue = parseInt(time.value.replace(":", ""), 10);
      return (
        (start === "" || timeValue >= parseInt(start.replace(":", ""), 10)) &&
        (end === "" || timeValue <= parseInt(end.replace(":", ""), 10))
      );
    });
  };

  const handleAddTurf = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); // 🚀 Start loading

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

      await supabase.from("turfs").update(formattedTurf).eq("id", turfId);
      toast.success("Turf updated successfully");
      router.push("/admin/turfs");
    } catch (error) {
      setError(error);
      if (error instanceof Error) {
        toast.error("Error saving turf: " + error.message);
      } else {
        toast.error("Error saving turf");
      }
    } finally {
      setLoading(false); // 🧯 Stop loading
    }
  };

  return (
    <div className="  w-full ">
      <Button
        variant={"outline"}
        className="my-5"
        onClick={() => router.back()}
      >
        <ChevronLeft />
        Back
      </Button>
      <form className="flex  flex-col  gap-10 " onSubmit={handleAddTurf}>
        <Card className="shadow-md rounded-2xl  ">
          <CardHeader className="flex flex-row w-full bg-black/80 text-white justify-between rounded-t-2xl items-center ">
            <div className="font-bold text-2xl">Basic Details</div>
            <div className="flex items-center gap-5 bg-white p-2 rounded-lg justify-between ">
              <Label htmlFor="enable_turf" className="text-black">
                Disable Turf
              </Label>
              <div className="flex items-center  space-x-2">
                <Switch
                  id="enable_turf"
                  checked={enabled}
                  onCheckedChange={handleToggle}
                />
              </div>
            </div>
          </CardHeader>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Enable Turf</DialogTitle>
              </DialogHeader>

              <Label htmlFor="reason">Select Reason</Label>
              <Select
                onValueChange={setSelectedReason}
                value={selectedReason}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {siteConfig.disableReasons.map((r, index) => (
                    <SelectItem key={index} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedReason === "Custom Reason" && (
                <div className="mt-2">
                  <Label htmlFor="custom_reason">Enter Custom Reason</Label>
                  <Input
                    id="custom_reason"
                    placeholder="Type your reason..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                  />
                </div>
              )}

              <DialogFooter>
                <Button variant="secondary" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={
                    !selectedReason ||
                    (selectedReason === "Custom Reason" && !customReason.trim())
                  }
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <CardContent className="flex flex-col gap-5 mt-5">
            <div className="flex gap-5">
              <Input
                type="text"
                placeholder="Name"
                value={newTurf.name}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, name: e.target.value })
                }
                required
                disabled={loading}
              />
              <Input
                type="text"
                placeholder="Location"
                value={newTurf.location}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, location: e.target.value })
                }
                required
                disabled={loading}
              />
            </div>
            <div className="flex gap-5">
              <Input
                type="text"
                placeholder="Type"
                value={newTurf.type}
                onChange={(e) => {
                  setNewTurf({ ...newTurf, type: e.target.value });
                }}
                required
                disabled={loading}
              />
              <Input
                type="number"
                placeholder="Price Per Hour"
                value={newTurf.price_per_hour}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, price_per_hour: e.target.value })
                }
                min={0}
                required
                disabled={loading}
              />
            </div>

            <Textarea
              placeholder="Description"
              value={newTurf.description}
              onChange={(e) =>
                setNewTurf({ ...newTurf, description: e.target.value })
              }
              required
              disabled={loading}
            />

            <div className="flex gap-5">
              <Input
                type="number"
                placeholder="Minimum Hours of Duration"
                value={newTurf.min_hours}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, min_hours: e.target.value })
                }
                required
                disabled={loading}
                min={0}
              />

              <Input
                type="number"
                placeholder="Maximum Hours of Duration"
                value={newTurf.max_hours}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, max_hours: e.target.value })
                }
                required
                disabled={loading}
                min={0}
              />
            </div>

            <div className="flex gap-5">
              <Input
                type="number"
                min={0}
                placeholder="Max Players"
                value={newTurf.max_players}
                onChange={(e) =>
                  setNewTurf({ ...newTurf, max_players: e.target.value })
                }
                required
                disabled={loading}
              />

              <Select
                value={newTurf.slot_interval.toString()}
                onValueChange={(value) =>
                  setNewTurf({ ...newTurf, slot_interval: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="slot_interval">
                  <SelectValue placeholder="Select slot interval" />
                </SelectTrigger>
                <SelectContent>
                  {siteConfig.slotIntervals.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newTurf.slot_interval !== "" && (
              <div className="flex justify-between  gap-5 ">
                <span className="w-full  flex flex-col gap-1">
                  <label>Opening Time</label>

                  <TimePicker
                    disabled={loading}
                    interval={parseInt(newTurf.slot_interval)}
                    defaultValue={newTurf.opening_time}
                    onChange={(e) =>
                      setNewTurf({ ...newTurf, opening_time: e.target.value })
                    }
                  />
                </span>
                <span className="w-full flex flex-col gap-1">
                  <label>Closing Time</label>

                  <TimePicker
                    disabled={!newTurf.opening_time || loading}
                    interval={parseInt(newTurf.slot_interval)}
                    startTime={newTurf.opening_time}
                    defaultValue={newTurf.closing_time}
                    onChange={(e) =>
                      setNewTurf({ ...newTurf, closing_time: e.target.value })
                    }
                    validate={validateClosingTime}
                  />
                </span>
              </div>
            )}

            <div className="flex flex-col gap-5">
              <label>Turf Image</label>
              {!newTurf.image_url && (
                <div
                  {...getRootProps()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-100 transition-all"
                >
                  <input {...getInputProps()} disabled={loading} />
                  <p className="text-gray-600 text-lg font-medium">
                    Drag & drop images here
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    or click to browse
                  </p>
                </div>
              )}

              <div className=" space-y-3">
                {newTurf.image_url ? (
                  <div
                    key={newTurf.name}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={newTurf.image_url}
                        alt={newTurf.name}
                        className="w-12 h-12 object-cover rounded-md border border-gray-300"
                      />
                      <p className="text-gray-700 text-sm font-medium truncate max-w-[200px]">
                        {newTurf.name}
                      </p>
                    </div>
                    <Button
                      size="icon"
                      disabled={loading}
                      variant="destructive"
                      onClick={() => setNewTurf({ ...newTurf, image_url: "" })}
                      className="hover:bg-red-100 hover:text-red-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                ) : (
                  files.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between bg-gray-100 p-3 rounded-lg shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={file.preview}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-md border border-gray-300"
                        />
                        <p className="text-gray-700 text-sm font-medium truncate max-w-[200px]">
                          {file.name}
                        </p>
                      </div>
                      <Button
                        disabled={loading}
                        size="icon"
                        variant="destructive"
                        onClick={() => removeFile(file)}
                        className="hover:bg-red-100 hover:text-red-600 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekday Pricing */}
        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex bg-black/80 text-white justify-between rounded-t-2xl  ">
            <div className="font-bold text-2xl">Weekday Pricing</div>
          </CardHeader>
          <CardContent className="mt-5">
            <div className="flex items-center justify-between">
              <Label className="text-lg" htmlFor="enable_weekday_options">
                Enable Weekday Options
              </Label>
              <div className="flex items-center space-x-2">
                <span>{newTurf.is_weekday_pricing_enabled ? "On" : "Off"}</span>
                <Switch
                  disabled={loading}
                  id="enable_weekday_options"
                  checked={newTurf.is_weekday_pricing_enabled}
                  onCheckedChange={(e) => {
                    setNewTurf({ ...newTurf, is_weekday_pricing_enabled: e });
                  }}
                />
              </div>
            </div>
            {newTurf.is_weekday_pricing_enabled && (
              <div className="flex flex-col gap-5 mt-5">
                <div className="flex w-full gap-5">
                  <div className="w-full">
                    <Label>Weekday Morning Start</Label>
                    <Select
                      defaultValue={formatToAMPM(newTurf.weekday_morning_start)}
                      disabled={!newTurf.opening_time || loading}
                      onValueChange={(morningTime) => {
                        setNewTurf({
                          ...newTurf,
                          weekday_morning_start: formatTo24Hour(morningTime),
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select morning time" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.morningTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label>Weekday Evening Start</Label>
                    <Select
                      disabled={loading}
                      defaultValue={formatToAMPM(newTurf.weekday_evening_start)}
                      onValueChange={(eveningTime) => {
                        setNewTurf({
                          ...newTurf,
                          weekday_evening_start: formatTo24Hour(eveningTime),
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select evening time" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.eveningTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-full">
                    <Label htmlFor="weekday_morning_price">
                      Weekday Morning Price
                    </Label>
                    <Input
                      id="weekday_morning_price"
                      type="number"
                      min={0}
                      value={newTurf.weekday_morning_price ?? 0}
                      onChange={(weekdayMorningPrice) => {
                        setNewTurf({
                          ...newTurf,
                          weekday_morning_price:
                            weekdayMorningPrice.target.value,
                        });
                      }}
                      placeholder="Enter price"
                      disabled={loading}
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="weekday_evening_price">
                      Weekday Evening Price
                    </Label>
                    <Input
                      id="weekday_evening_price"
                      type="number"
                      min={0}
                      value={newTurf.weekday_evening_price ?? 0}
                      onChange={(weekdayEveningPrice) => {
                        setNewTurf({
                          ...newTurf,
                          weekday_evening_price:
                            weekdayEveningPrice.target.value,
                        });
                      }}
                      placeholder="Enter price"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-md rounded-2xl">
          <CardHeader className="flex bg-black/80 text-white justify-between rounded-t-2xl  ">
            <div className="font-bold text-2xl">Weekend Pricing</div>
          </CardHeader>
          <CardContent className="mt-5">
            <div className="flex items-center justify-between">
              <Label className="text-lg" htmlFor="enable_weekend_options">
                Enable Weekend Options
              </Label>
              <div className="flex items-center space-x-2">
                <span>{newTurf.is_weekend_pricing_enabled ? "On" : "Off"}</span>
                <Switch
                  disabled={loading}
                  id="enable_weekend_options"
                  checked={newTurf.is_weekend_pricing_enabled}
                  onCheckedChange={(e) => {
                    setNewTurf({ ...newTurf, is_weekend_pricing_enabled: e });
                  }}
                />
              </div>
            </div>
            {newTurf.is_weekend_pricing_enabled && (
              <div className="flex flex-col gap-5 mt-5">
                <div className="flex w-full gap-5">
                  <div className="w-full">
                    <Label>Weekend Morning Start</Label>
                    <Select
                      value={formatToAMPM(newTurf.weekend_morning_start)}
                      onValueChange={(weekendMorningStart) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_morning_start:
                            formatTo24Hour(weekendMorningStart),
                        })
                      }
                      disabled={loading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select morning time" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.morningTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full">
                    <Label>Weekend Evening Start</Label>
                    <Select
                      disabled={loading}
                      value={formatToAMPM(newTurf.weekend_evening_start)}
                      onValueChange={(weekendEveningStart) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_evening_start:
                            formatTo24Hour(weekendEveningStart),
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select evening time" />
                      </SelectTrigger>
                      <SelectContent>
                        {siteConfig.eveningTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="w-full">
                    <Label htmlFor="weekend_morning_price">
                      Weekend Morning Price
                    </Label>
                    <Input
                      id="weekend_morning_price"
                      type="number"
                      value={newTurf.weekend_morning_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_morning_price: e.target.value,
                        })
                      }
                      placeholder="Enter price"
                    />
                  </div>
                  <div className="w-full">
                    <Label htmlFor="weekend_evening_price">
                      Weekend Evening Price
                    </Label>
                    <Input
                      id="weekend_evening_price"
                      type="number"
                      value={newTurf.weekend_evening_price}
                      onChange={(e) =>
                        setNewTurf({
                          ...newTurf,
                          weekend_evening_price: e.target.value,
                        })
                      }
                      placeholder="Enter price"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Button type="submit" className=" w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="animate-spin mr-2" />
              Updating...
            </div>
          ) : (
            "Update Turf"
          )}
        </Button>
      </form>
    </div>
  );
};

export default CreateNewTurf;
