import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useState } from "react";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const GetInTouch = () => {
  const [failedSubmissions, setFailedSubmissions] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await fetch("/api/get-in-touch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to send");

      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
      setFailedSubmissions((prev) => [...prev, data]);
    }
  };

  return (
    <section
      id="contact"
      className="relative w-full min-h-screen flex items-center justify-center bg-black/50 px-4 sm:px-6 md:px-8"
    >
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <Image
          src="/GetInTouch/GetInTouch.webp"
          alt="Background"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      <Card className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl p-6 sm:p-8 md:p-10 shadow-xl rounded-xl bg-white/20 backdrop-blur-lg border border-white/30">
        <CardHeader>
          <CardTitle className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-white">
            Get in Touch
          </CardTitle>
          <p className="text-gray-200 text-center text-sm sm:text-base md:text-lg">
            Have questions? Reach out and we'll get back to you.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                placeholder="Your Name"
                {...register("name")}
                className="bg-white/30 text-white placeholder-white w-full"
              />
              {errors.name && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {errors.name?.message as string}
                </p>
              )}
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your Email"
                {...register("email")}
                className="bg-white/30 text-white placeholder-white w-full"
              />
              {errors.email && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {errors.email.message as string}
                </p>
              )}
            </div>
            <div>
              <Textarea
                placeholder="Your Message"
                {...register("message")}
                className="bg-white/30 text-white placeholder-white w-full"
              />
              {errors.message && (
                <p className="text-red-500 text-xs sm:text-sm">
                  {errors.message?.message as string}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full text-sm sm:text-base"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default GetInTouch;
