import { Button } from "@/components/ui/button";
import { formatToAMPM } from "@/lib/convertTime";
import { Ban, AlertCircle, RefreshCcw, HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Failure({ bookingData }: any) {
  const router = useRouter();

  return (
    <div className="w-full relative">
      <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-orange-500/20 blur-3xl rounded-full" />

      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-red-500/10 p-6 border-b border-red-500/20 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4 ring-2 ring-red-500/40">
            <Ban className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Booking Failed</h2>
          <p className="text-gray-400">
            Something went wrong with the payment.
          </p>
        </div>

        {/* Details & Actions */}
        <div className="p-6 space-y-6">
          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">
              It looks like the transaction was declined or interrupted. No
              charges should have been made.
            </p>
          </div>

          <div className="bg-white/5 rounded-xl p-4 border border-white/10 space-y-3">
            <p className="text-sm text-gray-400 uppercase tracking-wider font-semibold">
              Attempted Booking
            </p>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Turf</span>
              <span className="text-white font-medium">
                {bookingData.turf_name}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-300">Amount</span>
              <span className="text-white font-medium">
                ₹{bookingData.total_price}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              variant="default"
              className="w-full bg-white text-black hover:bg-white/90 font-bold py-6 rounded-xl transition-all flex items-center gap-2"
              onClick={() => router.push("/booking")}
            >
              <RefreshCcw className="w-4 h-4" />
              Try Booking Again
            </Button>

            <Button
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-white/5 py-4 rounded-xl flex items-center gap-2"
              onClick={() => window.open("mailto:support@turfbook.com")}
            >
              <HelpCircle className="w-4 h-4" />
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
