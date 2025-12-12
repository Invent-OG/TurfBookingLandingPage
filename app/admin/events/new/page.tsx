"use client";

import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { Input } from "@/components/ui/input";
import { RichTextarea } from "@/components/ui/rich-textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { NumberInput } from "@/components/ui/number-input";
import { format } from "date-fns";

import { useCreateEvent } from "@/hooks/use-events";
import { useUploadFile } from "@/hooks/use-storage";
import { useTurfs } from "@/hooks/use-turfs";

const NewEventPage = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: turfs = [] } = useTurfs();
  const createEventMutation = useCreateEvent();
  const uploadFileMutation = useUploadFile();

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [turfId, setTurfId] = useState("");
  const [eventType, setEventType] = useState("tournament");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [registrationType, setRegistrationType] = useState("team");
  const [maxParticipants, setMaxParticipants] = useState(16);
  const [price, setPrice] = useState(500);
  const [prizeDetails, setPrizeDetails] = useState("");
  const [rules, setRules] = useState("");
  const [bannerImage, setBannerImage] = useState<string | null>(null);

  // Image Upload
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const { url } = await uploadFileMutation.mutateAsync({
        bucket: "turf-images", // Or generic 'events' bucket if preferred, keeping turf-images for now
        file,
      });
      setBannerImage(url);
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    accept: { "image/*": [] },
  });

  // Fetch Turfs handled by useTurfs hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createEventMutation.mutateAsync({
        title,
        description,
        turfId: turfId || turfs[0]?.id, // fallback
        eventType,
        startDate: startDate ? format(startDate, "yyyy-MM-dd") : "",
        endDate: endDate ? format(endDate, "yyyy-MM-dd") : "",
        startTime,
        endTime,
        registrationType: registrationType as "individual" | "team",
        maxParticipants,
        price: String(price),
        prizeDetails,
        rules,
        bannerImage,
      });

      toast.success("Event created successfully");
      router.push("/admin/events");
    } catch (error) {
      toast.error("Error creating event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading">
          Create New Event
        </h1>
        <p className="text-gray-400">
          Host a tournament, league or coaching camp.
        </p>
      </div>

      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Event Title</Label>
              <Input
                placeholder="e.g. Summer Football League"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-white/5 border-white/10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Select Turf</Label>
              <Select value={turfId} onValueChange={setTurfId}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose Turf" />
                </SelectTrigger>
                <SelectContent className="bg-turf-dark border-white/10 text-white">
                  {turfs.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-turf-dark border-white/10 text-white">
                  <SelectItem value="tournament">Tournament</SelectItem>
                  <SelectItem value="league">League</SelectItem>
                  <SelectItem value="coaching">Coaching Camp</SelectItem>
                  <SelectItem value="pickup">Pickup Game</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <RichTextarea
              placeholder="Describe the event..."
              className="bg-white/5 border-white/10 min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Schedule */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <DatePicker date={startDate} setDate={setStartDate} />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <DatePicker date={endDate} setDate={setEndDate} />
            </div>
            <div className="space-y-2">
              <Label>Start Time</Label>
              <TimePicker value={startTime} onChange={setStartTime} />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <TimePicker value={endTime} onChange={setEndTime} />
            </div>
          </div>

          {/* Registration Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>Registration Type</Label>
              <Select
                value={registrationType}
                onValueChange={setRegistrationType}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-turf-dark border-white/10 text-white">
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Max Participants/Teams</Label>
              <NumberInput
                value={maxParticipants}
                onChange={setMaxParticipants}
                min={2}
                max={100}
              />
            </div>
            <div className="space-y-2">
              <Label>Entry Fee (₹)</Label>
              <NumberInput
                value={price}
                onChange={setPrice}
                min={0}
                max={100000}
                step={100}
              />
            </div>
          </div>

          {/* Rich Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Prize Details</Label>
              <RichTextarea
                placeholder="Winner: ₹10,000 + Trophy..."
                className="bg-white/5 border-white/10 min-h-[100px]"
                value={prizeDetails}
                onChange={(e) => setPrizeDetails(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Rules & Guidelines</Label>
              <RichTextarea
                placeholder="1. No studs allowed..."
                className="bg-white/5 border-white/10 min-h-[100px]"
                value={rules}
                onChange={(e) => setRules(e.target.value)}
              />
            </div>
          </div>

          {/* Banner Image */}
          <div className="space-y-2">
            <Label>Banner Image</Label>
            <div
              {...getRootProps()}
              className={`border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-turf-neon/50 ${bannerImage ? "bg-black/20" : "bg-white/5"}`}
            >
              <input {...getInputProps()} />
              {bannerImage ? (
                <div className="relative h-48 w-full max-w-md mx-auto">
                  <img
                    src={bannerImage}
                    alt="Banner"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBannerImage(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload className="w-8 h-8" />
                  <p>Drag & drop an image here, or click to select</p>
                </div>
              )}
            </div>
          </div>

          <NeonButton
            type="submit"
            className="w-full md:w-auto"
            disabled={loading}
            glow
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create Event
          </NeonButton>
        </form>
      </GlassCard>
    </div>
  );
};

export default NewEventPage;
