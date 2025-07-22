"use client";

import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Turf } from "@/types/turf";
import { cn } from "@/lib/utils";
import { useTurfStore } from "@/lib/store/turf";

export default function TurfImageGallery() {
  const { setSelectedTurf, setTurfs, turfs } = useTurfStore();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

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
  }, [setTurfs]);

  return (
    <div className="relative flex flex-col items-center justify-center px-6 py-16 min-h-screen overflow-hidden bg-green-100">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-700 opacity-20 blur-3xl"></div>
      <div className="absolute inset-0 flex justify-center items-center">
        <div className="w-96 h-96 bg-white rounded-full opacity-10 blur-3xl"></div>
      </div>

      {/* Heading */}
      <div className="text-center max-w-7xl  mx-auto relative z-10">
        <h2 className="text-4xl md:text-5xl font-extrabold text-green-900">
          Choose Your Perfect Turf & Play Your Game!
        </h2>
        <p className="text-lg text-green-700 max-w-2xl mx-auto mt-2">
          Football, Cricket, or Multi-Sport—Book the best turf for your game,
          anytime!
        </p>
      </div>

      {/* Turf Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 relative z-10">
        {isLoading && (
          <div className="col-span-3 text-center">
            <p className="text-lg text-green-700">Loading turfs...</p>
          </div>
        )}
        {turfs.map((turf) => (
          <div
            key={turf.id}
            className={cn(
              "rounded-lg shadow-lg overflow-hidden relative  bg-white transition-transform transform hover:scale-105",
              turf.is_disabled ? " cursor-not-allowed border" : "cursor-pointer"
            )}
          >
            {/* Background Image */}
            <img
              src={turf.image_url}
              alt={turf.name}
              className="w-full h-48 object-cover"
            />
            {/* Content */}

            <div className="p-6">
              <h3 className="text-xl font-bold text-green-900 mb-2">
                {turf.name}
              </h3>
              <p className="text-green-700 mb-4">Located at {turf.location}</p>
              {turf.is_disabled ? (
                <p className="w-full  text-center text-green-500 font-semibold py-2 rounded-lg transition">
                  {turf.disabled_reason}
                </p>
              ) : (
                <Button
                  disabled={turf.is_disabled}
                  onClick={() => {
                    setSelectedTurf(turf);

                    toast.success("Turf selected: " + turf.name);
                    // Redirect to booking page
                    router.push("/booking");
                  }}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-semibold py-2 rounded-lg transition"
                >
                  Book Now
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
