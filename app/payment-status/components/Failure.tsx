import { Button } from "@/components/ui/button";
import { formatToAMPM } from "@/lib/convertTime";
import { Ban } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Failure({ bookingData }: any) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col justify-center items-center bg-red-600 p-5 text-white ">
      <div className="max-w-md w-full text-center space-y-6">
        <Ban className="w-16 h-16 text-white mx-auto" />
        <h2 className="text-3xl font-bold">Booking Failed </h2>
        <p className="text-lg">
          Unfortunately, your booking could not be processed.
        </p>

        <div className="bg-white text-gray-800 p-6 rounded-lg shadow-md w-full">
          <h3 className="text-xl font-semibold mb-3 text-center">
            Attempted Booking Details
          </h3>
          <div className="space-y-2 text-left text-sm">
            <p>
              <strong>Turf Type:</strong> {bookingData.turf_name}
            </p>
            <p>
              <strong>Date:</strong> {bookingData.date}
            </p>
            <p>
              <strong>Start Time:</strong>{" "}
              {formatToAMPM(bookingData.start_time)}
            </p>
            <p>
              <strong>Duration:</strong> {bookingData.duration} hours
            </p>
            <p>
              <strong>Total Price:</strong> ₹{bookingData.total_price}
            </p>
          </div>
        </div>

        <Button
          variant="default"
          className="w-full bg-red-700 hover:bg-red-800 text-white font-medium py-2 rounded-lg"
          onClick={() => router.push("/booking")}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
