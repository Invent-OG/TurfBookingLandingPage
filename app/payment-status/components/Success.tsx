import { Button } from "@/components/ui/button";
import { formatToAMPM } from "@/lib/convertTime";
import { CheckCircle, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Success({ bookingData }: any) {
  const router = useRouter();

  return (
    <div className="w-full relative">
      <div className="absolute inset-0 bg-gradient-to-r from-turf-neon/20 to-blue-500/20 blur-3xl rounded-full" />

      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-green-500/10 p-6 border-b border-green-500/20 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-green-500/40">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-400">Get ready for the game! ⚽</p>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-6">
          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-turf-neon mt-1" />
              <div>
                <p className="text-sm text-gray-400">Arena</p>
                <span className="text-white font-medium">
                  {bookingData.turfName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-turf-neon mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Date</p>
                  <p className="font-medium text-white">{bookingData.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-turf-neon mt-1" />
                <div>
                  <p className="text-sm text-gray-400">Time</p>
                  <p className="font-medium text-white">
                    {formatToAMPM(bookingData.startTime)}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Ticket className="w-5 h-5 text-turf-neon mt-1" />
              <div>
                <p className="text-sm text-gray-400">Duration</p>
                <p className="font-medium text-white">
                  {bookingData.duration} hour(s)
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center py-4 border-t border-white/10 border-dashed">
            <span className="text-gray-400">Total Paid</span>
            <span className="text-white font-medium">
              ₹{bookingData.totalPrice}
            </span>
          </div>

          <Button
            variant="default"
            className="w-full bg-turf-neon hover:bg-turf-neon/80 text-black font-bold py-6 rounded-xl transition-all"
            onClick={() => router.push("/")}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
