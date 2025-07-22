"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Turf } from "@/types/turf";
import { useTurfStore } from "@/lib/store/turf";

function ManageTurfs() {
  const { turfs, setTurfs } = useTurfStore();

  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTurf, setSelectedTurf] = useState<Turf | null>(null);

  const router = useRouter();

  const formatTime = (time: string) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":"); // Extract HH and MM
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12; // Convert 24-hour to 12-hour format

    return `${formattedHour}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    const fetchTurfs = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("turfs").select("*");
      if (error) {
        setError(error);
        toast.error("Error fetching turfs: " + error.message);
      } else {
        setTurfs(data as Turf[]);
      }
      setIsLoading(false);
    };
    fetchTurfs();

    console.log(turfs, "global state");
  }, [setTurfs]);

  const handleConfirmDelete = async () => {
    if (!selectedTurf) return;

    try {
      const { id, image_url } = selectedTurf;

      if (image_url) {
        try {
          // 🔍 Extract the file path correctly
          const urlParts = new URL(image_url);
          const fullPath = decodeURIComponent(urlParts.pathname);
          const bucketName = "turf-images"; // Change if needed

          // Ensure only the relative path is extracted
          const filePath = fullPath.split(`/${bucketName}/`)[1];

          console.log("🔍 Extracted file path:", filePath);

          // 🔥 Try deleting the image
          const { error: storageError } = await supabase.storage
            .from(bucketName)
            .remove([filePath]);

          if (storageError) {
            console.error("❌ Error deleting image:", storageError.message);
          } else {
            console.log("✅ Image deleted successfully from Supabase storage");
          }
        } catch (pathError) {
          console.error("❌ Error extracting file path:", pathError);
        }
      }

      // ✅ Delete turf from database
      const { error: dbError } = await supabase
        .from("turfs")
        .delete()
        .eq("id", id);
      if (dbError) throw dbError;

      toast.success("Turf deleted successfully");

      // Refresh turfs list
      const { data } = await supabase.from("turfs").select("*");
      setTurfs(data as Turf[]);
    } catch (error: any) {
      toast.error("❌ Error deleting turf: " + error.message);
    } finally {
      setSelectedTurf(null);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Turfs</h1>
        <Button
          onClick={() => {
            router.push("/admin/turfs/create");
          }}
          className="mt-4"
        >
          <Plus /> Add New Turf
        </Button>
      </div>

      {error && error.message}
      {isLoading ? (
        <p className="text-center mt-4">Loading...</p>
      ) : turfs.length === 0 ? (
        <p className="text-center mt-4">No turfs available</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {turfs.map((turf) => (
            <div
              key={turf.id}
              className="border p-4 flex flex-col gap-5 justify-between  rounded-lg shadow-md"
            >
              {turf.is_disabled && (
                <div className="bg-red-100 text-red-800 p-2 flex flex-col items-center gap-2 rounded-md">
                  <strong>Disabled: {turf.disabled_reason}</strong>
                </div>
              )}

              {turf.image_url ? (
                <img
                  src={turf.image_url}
                  alt="Preview"
                  className="w-full h-32 mt-2 rounded-lg object-cover border border-gray-300 shadow"
                />
              ) : (
                <span className="w-full h-32 mt-2 border-gray-300 bg-gray-100 flex justify-center items-center shadow rounded-lg">
                  No Image Available
                </span>
              )}
              <h2 className="text-xl font-bold">{turf.name}</h2>

              <div className="space-y-2">
                <p>
                  <strong>Description:</strong> {turf.description}
                </p>
                <p>
                  <strong>Location:</strong> {turf.location}
                </p>
                <p>
                  <strong>Type:</strong> {turf.type}
                </p>
                <p>
                  <strong>Price Per Hour:</strong> ₹{turf.price_per_hour}
                </p>
                <p>
                  <strong>Opening Time:</strong> {formatTime(turf.opening_time)}
                </p>
                <p>
                  <strong>Closing Time:</strong> {formatTime(turf.closing_time)}
                </p>
                <p>
                  <strong>Max Players:</strong> {turf.max_players}
                </p>
                <p>
                  <strong>Maximum Hours of Duration:</strong> {turf.max_hours}
                </p>
                <p>
                  <strong>Minimum Hours of Duration:</strong> {turf.min_hours}
                </p>
              </div>
              <div className="flex justify-between ">
                <Button
                  onClick={() => setSelectedTurf(turf)}
                  variant="destructive"
                >
                  Delete
                </Button>

                <Button
                  onClick={() => {
                    router.push(`/admin/turfs/edit?id=${turf.id}`);
                  }}
                  className=""
                >
                  Edit
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedTurf} onOpenChange={() => setSelectedTurf(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete
              <strong>{selectedTurf?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-400 rounded-md">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-sm text-red-600">
              Deleting this turf will also remove all associated bookings.
            </span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTurf(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ManageTurfs;
