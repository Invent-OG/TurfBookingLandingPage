import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { format, parseISO, isValid } from "date-fns";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft } from "lucide-react";

const bookingFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormValues) => void;
  isLoading?: boolean;
  bookingDetails: {
    date?: string; // Make it optional for safety
    startTime: string;
    endTime: string;
    amount: number;
    court: string;
  };
}

export function BookingForm({
  onSubmit,
  isLoading,
  bookingDetails,
}: BookingFormProps) {
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
    },
  });

  const router = useRouter();

  // Handle invalid or missing date
  let formattedDate = "Invalid Date";
  if (bookingDetails.date) {
    const parsedDate = parseISO(bookingDetails.date);
    if (isValid(parsedDate)) {
      formattedDate = format(parsedDate, "MMMM d, yyyy");
    }
  }

  return (
    <div className="max-w-lg mx-auto rounded-xl shadow-md bg-white lg:p-10 p-6 border space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold ">Complete Your Booking</h1>
        <p className="text-gray-600">
          Please provide your details to confirm the booking.
        </p>
      </div>
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-3">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span>{formattedDate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Time</span>
            <span>
              {bookingDetails.startTime} - {bookingDetails.endTime}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Court</span>
            <span>{bookingDetails.court}</span>
          </div>
          <div className="flex justify-between font-semibold">
            <span>Total Amount</span>
            <span>₹{bookingDetails.amount}</span>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="john@example.com"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="1234567890" type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Proceed to payment"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-full"
            onClick={() => router.back()}
          >
            Back
          </Button>
        </form>
      </Form>
    </div>
  );
}
