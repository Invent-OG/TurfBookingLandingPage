"use client";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

const InstagramEmbed = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  return (
    <div className="relative flex flex-col gap-6 md:pt-24 py-20 items-center justify-center px-4 min-h-screen/2 overflow-hidden">
      {/* Heading */}
      <div className="text-center relative z-10 max-w-2xl space-y-4">
        <h2 className="text-4xl md:text-5xl font-black text-white font-heading uppercase italic tracking-tighter">
          Stay <span className="text-turf-neon">Connected</span>
        </h2>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Catch live updates, player highlights, and special turf events from
          our official feed!
        </p>
        <div className="w-24 h-1 bg-gradient-to-r from-transparent via-turf-neon to-transparent mx-auto rounded-full"></div>
      </div>

      {/* Instagram Card */}
      <Card className="relative z-10 max-w-xl w-full p-2 shadow-2xl shadow-black/50 border border-white/10 rounded-2xl bg-black/40 backdrop-blur-md mt-8">
        <CardContent className="p-0 rounded-xl overflow-hidden">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink="https://www.instagram.com/cristiano/"
            data-instgrm-version="12"
            style={{
              width: "100%",
              background: "#FFF",
              borderRadius: "12px",
              overflow: "hidden",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramEmbed;
