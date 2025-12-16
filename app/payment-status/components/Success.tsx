import { Button } from "@/components/ui/button";
import { formatToAMPM } from "@/lib/convertTime";
import { CheckCircle, Calendar, Clock, MapPin, Ticket } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Success({ bookingData }: any) {
  const router = useRouter();

  return (
    <div className="w-full relative px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-turf-neon/10 to-blue-500/10 blur-3xl rounded-full" />

      {/* Sporty Card Container */}
      <div className="relative transform skew-x-[-6deg]">
        <div className="relative bg-turf-dark/90 backdrop-blur-xl border border-white/10 p-1 overflow-hidden shadow-[0_0_50px_-10px_rgba(204,255,0,0.15)]">
          {/* Neon Corner Accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-turf-neon z-20"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-turf-neon z-20"></div>

          <div className="bg-black/50 p-8 md:p-12 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Animated Success Icon (Sporty Style) */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-turf-neon blur-2xl opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-black border-2 border-turf-neon flex items-center justify-center relative skew-x-[-10deg] shadow-[0_0_20px_rgba(204,255,0,0.4)]">
                  <CheckCircle className="w-12 h-12 text-turf-neon skew-x-[10deg]" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2 font-heading">
                Booking{" "}
                <span className="text-transparent text-stroke-neon">
                  Confirmed
                </span>
              </h2>
              <p className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-10">
                Get ready to dominate the field
              </p>

              {/* Ticket Details Box */}
              <div className="w-full bg-white/5 border border-white/10 p-6 md:p-8 space-y-6 relative mb-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-black rotate-45 border border-white/10"></div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-black rotate-45 border border-white/10"></div>

                <div className="flex flex-col gap-6">
                  {/* Arena Info */}
                  <div className="text-center pb-6 border-b border-white/10 border-dashed">
                    <p className="text-[10px] text-turf-neon font-black uppercase tracking-widest mb-1">
                      Arena Secured
                    </p>
                    <h3 className="text-2xl font-black text-white italic uppercase font-heading">
                      {bookingData.turfName}
                    </h3>
                  </div>

                  {/* Grid Details */}
                  <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Date
                      </p>
                      <p className="text-lg font-bold text-white font-mono">
                        {bookingData.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Time
                      </p>
                      <p className="text-lg font-bold text-white font-mono">
                        {formatToAMPM(bookingData.startTime)}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Duration
                      </p>
                      <p className="text-lg font-bold text-white font-mono">
                        {bookingData.duration} HR
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                        Total Paid
                      </p>
                      <p className="text-2xl font-black text-turf-neon italic">
                        ₹{bookingData.totalPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <Button
                className="w-full bg-turf-neon text-black font-black text-lg py-6 rounded-none skew-x-[-10deg] hover:bg-white hover:scale-[1.02] transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(204,255,0,0.3)]"
                onClick={() => router.push("/")}
              >
                <div className="skew-x-[10deg] flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  Return to Base
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
