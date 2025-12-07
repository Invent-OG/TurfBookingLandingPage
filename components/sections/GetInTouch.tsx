import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { toast } from "sonner";
import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const GetInTouch = () => {
  const [failedSubmissions, setFailedSubmissions] = useState<any[]>([]);
  const containerRef = useRef<HTMLElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(leftRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });

      gsap.from(formRef.current, {
        x: 50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

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
      ref={containerRef}
      id="contact"
      className="relative w-full py-24 flex items-center justify-center px-4 sm:px-6 md:px-8"
    >
      {/* Background Elements Removed */}

      {/* Content Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
        <div ref={leftRef} className="space-y-6 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter leading-none">
            Get In <br />
            <span className="text-turf-neon text-stroke-neon">Touch</span>
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto md:mx-0">
            Have questions or need assistance? Reach out to our team and we'll
            help you get back in the game.
          </p>

          <div className="hidden md:flex gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 text-center group hover:bg-turf-neon/10 transition-colors">
              <h3 className="text-turf-neon font-bold text-xl mb-1">24/7</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                Support
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex-1 text-center group hover:bg-turf-blue/10 transition-colors">
              <h3 className="text-turf-blue font-bold text-xl mb-1">Fast</h3>
              <p className="text-gray-500 text-xs uppercase tracking-wider">
                Response
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div ref={formRef}>
          <Card className="w-full p-6 sm:p-8 shadow-2xl shadow-black/50 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10">
            <CardHeader className="px-0 pt-0 pb-6">
              <CardTitle className="text-2xl font-bold text-white uppercase tracking-wide">
                Send a Message
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="Your Name"
                    {...register("name")}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-0 transition-all h-12 rounded-lg"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs font-medium pl-1">
                      {errors.name?.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Your Email"
                    {...register("email")}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-0 transition-all h-12 rounded-lg"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs font-medium pl-1">
                      {errors.email.message as string}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Textarea
                    placeholder="Your Message..."
                    {...register("message")}
                    className="bg-white/5 border-white/10 text-white placeholder-gray-500 focus:border-turf-neon/50 focus:ring-0 transition-all min-h-[120px] rounded-lg resize-none"
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs font-medium pl-1">
                      {errors.message?.message as string}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-turf-neon hover:bg-turf-neon/80 text-turf-dark font-bold text-base rounded-lg shadow-lg shadow-neon-green/20 transition-all uppercase tracking-wider"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
