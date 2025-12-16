"use client";
import { useEffect } from "react";

const InstagramEmbed = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative flex flex-col gap-6 md:pt-24 py-20 items-center justify-center px-4 overflow-hidden">
      {/* Heading */}
      <div className="text-center max-w-4xl mx-auto relative z-10 mb-12 space-y-6">
        <h2 className="text-4xl md:text-6xl font-black text-white font-heading uppercase italic tracking-tighter">
          Follow <span className="text-stroke-neon text-transparent">Us</span>
        </h2>
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
          Catch live updates, player highlights, and special turf events.
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Instagram Frame */}
      <div className="relative z-10 max-w-xl w-full">
        <div className="relative bg-black/40 backdrop-blur-md border border-white/10 p-2 transform transition-all duration-300 hover:border-turf-neon hover:shadow-[0_0_30px_rgba(204,255,0,0.15)] group">
          {/* Neon Corners */}
          <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-turf-neon opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-turf-neon opacity-50 group-hover:opacity-100 transition-opacity"></div>

          <div className="overflow-hidden">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink="https://www.instagram.com/krpsportszone/"
              data-instgrm-version="12"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                overflow: "hidden",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramEmbed;
