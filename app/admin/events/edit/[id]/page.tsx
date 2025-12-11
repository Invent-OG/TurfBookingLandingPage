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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { useDropzone } from "react-dropzone";
import { Upload, X, Loader2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { DatePicker } from "@/components/ui/date-picker";
import { TimePicker } from "@/components/ui/time-picker";
import { NumberInput } from "@/components/ui/number-input";
import { format } from "date-fns";
import {
  useEvent,
  useUpdateEvent,
  useEventRegistrations,
} from "@/hooks/use-events";
import { useUploadFile } from "@/hooks/use-storage";
import { useTurfs } from "@/hooks/use-turfs";

const EditEventPage = () => {
  const router = useRouter();
  const params = useParams(); // Should be { id: string } but typing can be loose
  const eventId = params?.id as string;

  const { data: event, isLoading: eventLoading } = useEvent(eventId);
  const { data: turfs = [] } = useTurfs();
  const updateEventMutation = useUpdateEvent();
  const uploadFileMutation = useUploadFile();
  const [loading, setLoading] = useState(false); // For form submission

  // Form State initialized in useEffect when event data is loaded

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

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setTurfId(event.turfId);
      setEventType(event.eventType);
      setStartDate(new Date(event.startDate));
      setEndDate(new Date(event.endDate));
      setStartTime(event.startTime);
      setEndTime(event.endTime);
      setRegistrationType(event.registrationType);
      setMaxParticipants(event.maxParticipants);
      setPrice(Number(event.price));
      setPrizeDetails(event.prizeDetails || "");
      setRules(event.rules || "");
      setBannerImage(event.bannerImage);
    }
  }, [event]);

  // Image Upload
  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const { url } = await uploadFileMutation.mutateAsync({
        bucket: "turf-images",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateEventMutation.mutateAsync({
        id: eventId,
        data: {
          title,
          description,
          turfId,
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
        },
      });

      toast.success("Event updated successfully");
      router.push("/admin/events");
    } catch (error) {
      toast.error("Error updating event");
    } finally {
      setLoading(false);
    }
  };

  if (eventLoading) {
    return <div className="p-20 text-center text-white">Loading Event...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-white font-heading">
          Edit Event
        </h1>
        <p className="text-gray-400">Update event details.</p>
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
            Save Changes
          </NeonButton>
        </form>
      </GlassCard>

      {/* Registrations Section */}
      <GlassCard title="Registrations">
        <RegistrationsList eventId={eventId} />
      </GlassCard>
    </div>
  );
};

const RegistrationsList = ({ eventId }: { eventId: string }) => {
  const { data: registrations = [], isLoading: loading } =
    useEventRegistrations(eventId);
  const [selectedReg, setSelectedReg] = useState<any>(null);

  if (loading)
    return <div className="text-gray-400">Loading registrations...</div>;

  if (registrations.length === 0) {
    return <div className="text-gray-400">No registrations yet.</div>;
  }

  const handleExportCSV = () => {
    if (registrations.length === 0) return;

    const headers = [
      "User Name",
      "Email",
      "Team Name",
      "Members",
      "Payment Status",
      "Registered At",
    ];
    const rows = registrations.map((reg) => [
      reg.userName || "",
      reg.userEmail || "",
      reg.teamName || "",
      (reg.members || []).join(", "),
      reg.paymentStatus,
      reg.registeredAt
        ? format(new Date(reg.registeredAt), "yyyy-MM-dd HH:mm:ss")
        : "",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) => e.map((item) => `"${item}"`).join(",")),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registrations_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="overflow-x-auto relative">
      {registrations.length > 0 && (
        <div className="absolute top-0 right-0 p-2 z-10">
          <NeonButton
            size="sm"
            variant="secondary"
            onClick={(e) => {
              e.stopPropagation();
              handleExportCSV();
            }}
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </NeonButton>
        </div>
      )}
      <table className="w-full text-left text-sm text-gray-300">
        <thead className="bg-white/5 uppercase text-xs font-bold text-gray-400">
          <tr>
            <th className="px-4 py-3">User</th>
            <th className="px-4 py-3">Team</th>
            <th className="px-4 py-3">Members</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10">
          {registrations.map((reg) => (
            <tr
              key={reg.id}
              onClick={() => setSelectedReg(reg)}
              className="hover:bg-white/5 transition-colors cursor-pointer"
            >
              <td className="px-4 py-3">
                <div className="font-bold text-white">
                  {reg.userName || "Unknown"}
                </div>
                <div className="text-xs text-gray-500">
                  {reg.userEmail || "No Email"}
                </div>
              </td>
              <td className="px-4 py-3">
                {reg.teamName ? (
                  <span className="text-turf-neon font-medium">
                    {reg.teamName}
                  </span>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">
                {reg.members &&
                Array.isArray(reg.members) &&
                reg.members.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {reg.members.slice(0, 2).map((m: string, i: number) => (
                      <span
                        key={i}
                        className="bg-white/10 px-1.5 py-0.5 rounded text-xs"
                      >
                        {m}
                      </span>
                    ))}
                    {reg.members.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{reg.members.length - 2}
                      </span>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                    reg.paymentStatus === "paid"
                      ? "bg-green-500/20 text-green-500"
                      : reg.paymentStatus === "pending"
                        ? "bg-yellow-500/20 text-yellow-500"
                        : "bg-red-500/20 text-red-500"
                  }`}
                >
                  {reg.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {reg.registeredAt
                  ? format(new Date(reg.registeredAt), "MMM d, yyyy")
                  : "-"}
              </td>
              <td className="px-4 py-3 text-right">
                <NeonButton
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReg(reg);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </NeonButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Sheet
        open={!!selectedReg}
        onOpenChange={(open) => !open && setSelectedReg(null)}
      >
        <SheetContent
          side="right"
          className="bg-turf-dark border-l border-white/10 text-white z-[100] w-full max-w-md sm:max-w-lg"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-white">Registration Details</SheetTitle>
          </SheetHeader>
          {selectedReg && (
            <div className="space-y-6">
              <div className="space-y-6">
                <div className="space-y-1">
                  <Label className="text-gray-400">Participant Name</Label>
                  <p className="text-xl font-bold font-heading">
                    {selectedReg.userName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <Label className="text-gray-400">Email</Label>
                    <p className="text-white break-words">
                      {selectedReg.userEmail}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-gray-400">Registered At</Label>
                    <p className="text-white">
                      {selectedReg.registeredAt
                        ? format(
                            new Date(selectedReg.registeredAt),
                            "MMM d, yyyy p"
                          )
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-400">Payment Status</Label>
                  <div>
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-bold uppercase ${
                        selectedReg.paymentStatus === "paid"
                          ? "bg-green-500/20 text-green-500"
                          : selectedReg.paymentStatus === "pending"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : "bg-red-500/20 text-red-500"
                      }`}
                    >
                      {selectedReg.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {selectedReg.teamName && (
                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div className="space-y-1">
                    <Label className="text-turf-neon">Team Name</Label>
                    <p className="text-lg font-bold text-white">
                      {selectedReg.teamName}
                    </p>
                  </div>

                  {selectedReg.members && selectedReg.members.length > 0 && (
                    <div className="space-y-3">
                      <Label className="text-gray-400">Team Members</Label>
                      <div className="flex flex-col gap-2">
                        {selectedReg.members.map((m: string, i: number) => (
                          <div
                            key={i}
                            className="bg-white/5 px-3 py-2 rounded text-sm text-gray-200 border border-white/5 flex items-center"
                          >
                            <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs mr-3 text-gray-400">
                              {i + 1}
                            </span>
                            {m}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default EditEventPage;
