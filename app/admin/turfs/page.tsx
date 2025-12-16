"use client";
import { useState, useEffect } from "react";
import { useTurfs, useDeleteTurf } from "@/hooks/use-turfs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertTriangle,
  Plus,
  MapPin,
  Loader2,
  Edit,
  Trash2,
  Clock,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Turf } from "@/types/turf";
import { useUploadFile, useDeleteFile } from "@/hooks/use-storage"; // useUpload unused but consistent import if needed
import { GlassCard } from "@/components/ui/glass-card";
import { NeonButton } from "@/components/ui/neon-button";
import { cn } from "@/lib/utils";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";

function ManageTurfs() {
  const { data: turfs = [], isLoading } = useTurfs();
  const deleteTurfMutation = useDeleteTurf();
  const deleteFileMutation = useDeleteFile();

  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);
  const router = useRouter();

  const formatTime = (time: string) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleConfirmDelete = async () => {
    if (!selectedTurf) return;
    try {
      if (selectedTurf.imageUrl) {
        try {
          await deleteFileMutation.mutateAsync({
            bucket: "turf-images",
            path: selectedTurf.imageUrl,
          });
        } catch (err) {
          console.error("Failed to delete image", err);
          // Continue deleting turf even if image delete fails
        }
      }

      await deleteTurfMutation.mutateAsync(selectedTurf.id);
      toast.success("Turf deleted successfully");
    } catch (error: any) {
      toast.error("Error deleting turf");
    } finally {
      setSelectedTurf(null);
    }
  };

  if (isLoading && turfs.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-turf-neon h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white font-heading tracking-wide">
            My Turfs
          </h1>
          <p className="text-gray-400 mt-1">
            Manage your arenas, pricing, and availability.
          </p>
        </div>
        <NeonButton
          onClick={() => router.push("/admin/turfs/create")}
          className="flex items-center gap-2"
        >
          <Plus size={18} /> Add Arena
        </NeonButton>
      </div>

      {turfs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 glass-panel rounded-2xl border-dashed border-2 border-white/10">
          <h3 className="text-xl font-bold text-white mb-2">
            No Turfs Added Yet
          </h3>
          <p className="text-gray-400 mb-6">
            Get started by adding your first arena.
          </p>
          <NeonButton onClick={() => router.push("/admin/turfs/create")}>
            Add New Turf
          </NeonButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {turfs.map((turf) => (
            <GlassCard
              key={turf.id}
              className="group hover:border-turf-neon/50 transition-colors"
              noPadding
            >
              {/* Image Section */}
              <div className="relative h-48 w-full overflow-hidden bg-black/50">
                {turf.imageUrl ? (
                  <img
                    src={turf.imageUrl}
                    alt={turf.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    No Image
                  </div>
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                  {turf.isDisabled ? (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-lg">
                      Disabled
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-turf-neon text-turf-dark text-xs font-bold rounded-full shadow-neon-green">
                      Active
                    </span>
                  )}
                </div>

                {/* Price Badge */}
                <div className="absolute bottom-4 right-4 bg-turf-dark/80 backdrop-blur px-3 py-1 rounded-lg border border-white/10">
                  <span className="text-turf-neon font-bold">
                    ₹{turf.pricePerHour}
                  </span>
                  <span className="text-gray-400 text-xs">/hr</span>
                </div>
              </div>

              {/* Content Section */}
              <div className="p-6 space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-white font-heading">
                    {turf.name}
                  </h2>
                  <div className="flex items-center gap-1 text-turf-blue text-sm mt-1">
                    <MapPin size={14} />
                    <span>{turf.location}</span>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/5 text-gray-400">
                      <Clock size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Hours
                      </span>
                      <span className="text-xs text-white font-medium">
                        {formatTime(turf.openingTime)} -{" "}
                        {formatTime(turf.closingTime)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-white/5 text-gray-400">
                      <Users size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Capacity
                      </span>
                      <span className="text-xs text-white font-medium">
                        {turf.maxPlayers} Players
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() =>
                      router.push(`/admin/turfs/edit?id=${turf.id}`)
                    }
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors border border-white/5"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => setSelectedTurf(turf)}
                    className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/10"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <ConfirmationModal
        isOpen={!!selectedTurf}
        onClose={() => setSelectedTurf(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Arena"
        description={`Are you sure you want to delete ${selectedTurf?.name}? This will also remove all associated bookings and cannot be undone.`}
        loading={deleteTurfMutation.isPending}
        confirmLabel="Delete Arena"
      />
    </div>
  );
}

export default ManageTurfs;
