"use client";

import { BlurFade } from "../ui/blur-fade";
import { GlassCard } from "../ui/glass-card";
import { useState, useEffect } from "react";

export function BlurFadeDemo() {
  const [images, setImages] = useState<{ id: string; imageUrl: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gallery")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setImages(data);
        }
      })
      .catch((err) => console.error("Failed to load gallery", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="py-24 text-white relative overflow-hidden">
      {/* Background Glow Removed */}

      {/* Header Section */}
      <div className="text-center relative z-10 mb-16 space-y-4 px-4">
        <h2 className="text-4xl md:text-5xl font-black font-heading uppercase italic tracking-tighter text-white">
          Explore Our <span className="text-turf-neon">Arena</span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          High-quality turf spaces designed for your best game. Witness the
          ultimate sporting experience.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Gallery Grid */}
      <section id="photos" className="relative z-10 max-w-7xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-turf-neon border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            No images in gallery yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {images.map((img, idx) => (
              <BlurFade key={img.id} delay={0.25 + idx * 0.05} inView>
                <div className="group relative h-64 md:h-72 w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:border-turf-neon/50 hover:shadow-[0_0_20px_rgba(204,255,0,0.15)] transition-all duration-500">
                  <img
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    src={img.imageUrl}
                    alt={`Gallery image ${idx + 1}`}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <p className="text-turf-neon text-xs font-bold uppercase tracking-widest mb-1">
                        Turf Zone
                      </p>
                      <h3 className="text-white font-heading font-bold text-xl uppercase tracking-wide">
                        View Gallery
                      </h3>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
