import { Button } from "@/components/ui/button";
import { formatToAMPM } from "@/lib/convertTime";
import { Ban, AlertCircle, RefreshCcw, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Failure({ bookingData }: any) {
  const router = useRouter();

  return (
    <div className="w-full relative px-4">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-orange-600/10 blur-3xl rounded-full" />

      {/* Sporty Card Container */}
      <div className="relative transform skew-x-[-6deg]">
        <div className="relative bg-turf-dark/90 backdrop-blur-xl border border-white/10 p-1 overflow-hidden shadow-[0_0_50px_-10px_rgba(255,0,0,0.15)]">
          {/* Neon Corner Accents */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-red-600 z-20"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-red-600 z-20"></div>

          <div className="bg-black/50 p-8 md:p-12 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-30"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              {/* Animated Failure Icon (Sporty Style) */}
              <div className="mb-8 relative">
                <div className="absolute inset-0 bg-red-600 blur-2xl opacity-20 animate-pulse"></div>
                <div className="w-24 h-24 bg-black border-2 border-red-600 flex items-center justify-center relative skew-x-[-10deg] shadow-[0_0_20px_rgba(255,0,0,0.4)]">
                  <Ban className="w-12 h-12 text-red-600 skew-x-[10deg]" />
                </div>
              </div>

              {/* Heading */}
              <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-2 font-heading">
                Booking{" "}
                <span
                  className="text-transparent"
                  style={{
                    WebkitTextStroke: "2px #DC2626",
                    color: "transparent",
                  }}
                >
                  Failed
                </span>
              </h2>
              <p className="text-gray-400 font-medium uppercase tracking-widest text-sm mb-10">
                Action interrupted. Regroup and retry.
              </p>

              {/* Alert Box */}
              <div className="w-full bg-red-950/20 border border-red-500/20 p-6 relative mb-8 skew-x-[-2deg]">
                <div className="flex items-start gap-4">
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-red-500 font-black uppercase tracking-wider text-sm mb-1">
                      Transaction Declined
                    </h4>
                    <p className="text-gray-400 text-sm">
                      The play couldn't be completed. No charges were made to
                      your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Attempted Booking Details */}
              <div className="w-full bg-white/5 border border-white/10 p-6 space-y-4 relative mb-10">
                <div className="flex justify-between items-center border-b border-white/10 border-dashed pb-4">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Target Arena
                  </span>
                  <span className="text-white font-black italic uppercase">
                    {bookingData.turfName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Amount
                  </span>
                  <span className="text-xl font-black text-red-500 italic">
                    ₹{bookingData.totalPrice}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="w-full space-y-4">
                <Button
                  className="w-full bg-white text-black hover:bg-gray-200 font-black text-lg py-6 rounded-none skew-x-[-10deg] transition-all uppercase tracking-widest shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                  onClick={() => router.push("/")}
                >
                  <div className="skew-x-[10deg] flex items-center gap-2">
                    <RefreshCcw className="w-5 h-5" />
                    Retry Booking
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full text-gray-500 hover:text-white hover:bg-white/5 font-bold py-6 rounded-none skew-x-[-10deg] transition-all uppercase tracking-widest"
                  onClick={() => window.open("mailto:support@turfbook.com")}
                >
                  <div className="skew-x-[10deg] flex items-center gap-2">
                    <HelpCircle className="w-5 h-5" />
                    Contact Support
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
