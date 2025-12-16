"use client";

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
      {/* Background Elements Removed for Global Background */}

      {/* Content Container */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center relative z-10">
        <div ref={leftRef} className="space-y-6 text-center md:text-left">
          <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter leading-none">
            Get In <br />
            <span className="text-stroke-neon text-transparent">Touch</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto md:mx-0">
            Have questions or need assistance? Reach out to our team and we'll
            help you get back in the game.
          </p>

          <div className="hidden md:flex gap-6 mt-8">
            <div className="p-4 rounded-none border-l-4 border-turf-neon bg-white/5 flex-1 text-center group hover:bg-turf-neon/10 transition-all hover:skew-x-[-5deg] duration-300">
              <h3 className="text-turf-neon font-black font-heading italic text-2xl mb-0">
                24/7
              </h3>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                Support
              </p>
            </div>
            <div className="p-4 rounded-none border-r-4 border-white/20 bg-white/5 flex-1 text-center group hover:bg-white/10 transition-all hover:skew-x-[5deg] duration-300">
              <h3 className="text-white font-black font-heading italic text-2xl mb-0">
                Fast
              </h3>
              <p className="text-gray-400 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">
                Response
              </p>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div ref={formRef}>
          <div className="w-full p-1 bg-gradient-to-br from-white/10 to-transparent rounded-xl">
            <div className="w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-xl bg-black/80 backdrop-blur-xl border border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <div className="w-20 h-20 bg-turf-neon blur-[80px] rounded-full"></div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-wide font-heading mb-1">
                    Send a Message
                  </h3>
                  <div className="h-1 w-12 bg-turf-neon skew-x-[-20deg]"></div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="YOUR NAME"
                      {...register("name")}
                      className="bg-white/5 border-l-2 border-white/10 border-t-0 border-r-0 border-b-0 rounded-none text-white placeholder-gray-500 focus:border-l-turf-neon focus:bg-white/10 focus:ring-0 transition-all h-14 font-bold uppercase tracking-wider"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs font-bold uppercase italic pl-1">
                        {errors.name?.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="YOUR EMAIL"
                      {...register("email")}
                      className="bg-white/5 border-l-2 border-white/10 border-t-0 border-r-0 border-b-0 rounded-none text-white placeholder-gray-500 focus:border-l-turf-neon focus:bg-white/10 focus:ring-0 transition-all h-14 font-bold uppercase tracking-wider"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs font-bold uppercase italic pl-1">
                        {errors.email.message as string}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Textarea
                      placeholder="YOUR MESSAGE..."
                      {...register("message")}
                      className="bg-white/5 border-l-2 border-white/10 border-t-0 border-r-0 border-b-0 rounded-none text-white placeholder-gray-500 focus:border-l-turf-neon focus:bg-white/10 focus:ring-0 transition-all min-h-[120px] resize-none font-bold uppercase tracking-wider"
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs font-bold uppercase italic pl-1">
                        {errors.message?.message as string}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-14 bg-turf-neon hover:bg-turf-neon/80 text-turf-dark font-black text-lg rounded-none shadow-lg shadow-neon-green/20 transition-all uppercase tracking-widest skew-x-[-10deg] hover:skew-x-[-15deg] active:scale-95 duration-300 mt-4"
                    disabled={isSubmitting}
                  >
                    <span className="skew-x-[10deg] flex items-center justify-center gap-2">
                      {isSubmitting ? "SENDING..." : "SEND MESSAGE"}
                      <span className="w-2 h-2 bg-black rounded-full animate-pulse"></span>
                    </span>
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GetInTouch;
