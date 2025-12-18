"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { X, CheckCircle } from "lucide-react";
import { createPortal } from "react-dom";

type OfferPopupProps = {
  imageUrl?: string | null;
  isActive: boolean;
  title?: string | null;
  description?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  isButtonActive?: boolean;
};

export default function OfferPopup({
  imageUrl,
  isActive,
  title,
  description,
  buttonText,
  buttonLink,
  isButtonActive,
}: OfferPopupProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Check local storage and active status
    if (isActive && imageUrl && !pathname?.startsWith("/admin")) {
      const hidden = localStorage.getItem("hideOfferPopup");
      if (hidden !== "true") {
        const timer = setTimeout(() => setIsOpen(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, [isActive, imageUrl, pathname]);

  const handleClose = () => {
    setIsOpen(false);
    if (dontShowAgain) {
      localStorage.setItem("hideOfferPopup", "true");
    }
  };

  // Prevent rendering on server or admin pages
  if (!isActive || !imageUrl) return null;
  if (typeof window === "undefined") return null;
  if (pathname?.startsWith("/admin")) return null;

  return isOpen
    ? createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="relative max-w-lg w-full bg-transparent rounded-2xl overflow-hidden shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-300 flex flex-col">
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 z-20 p-2 bg-black/50 text-white hover:bg-black/70 rounded-full transition-colors backdrop-blur-sm"
            >
              <X size={20} />
            </button>

            {/* Poster Image */}
            <div
              className={`relative w-full bg-black ${title || description ? "aspect-[4/5]" : "aspect-[4/5]"} flex-shrink-0`}
            >
              <Image
                src={imageUrl}
                alt={title || "Special Offer"}
                fill
                className="object-cover"
                priority
              />

              {/* Content Overlay */}
              {(title ||
                description ||
                (isButtonActive && buttonText && buttonLink)) && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/90 to-transparent pt-20 pb-6 px-6 flex flex-col items-start text-left z-10">
                  {title && (
                    <h2 className="text-2xl font-bold text-white font-heading mb-2 leading-tight drop-shadow-md">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-gray-200 mb-4 leading-relaxed line-clamp-3 drop-shadow-sm">
                      {description}
                    </p>
                  )}

                  {isButtonActive && buttonText && buttonLink && (
                    <a
                      href={buttonLink}
                      className="px-6 py-2.5 bg-turf-neon text-black font-bold rounded-lg hover:shadow-neon-green transition-all transform hover:-translate-y-0.5 text-sm uppercase tracking-wide w-full text-center sm:w-auto"
                    >
                      {buttonText}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="bg-white/10 backdrop-blur-md p-3 flex items-center justify-center border-t border-white/10 absolute bottom-0 right-0 left-0 z-20">
              <label className="flex items-center gap-2 cursor-pointer text-white/90 text-xs hover:text-white transition-colors select-none">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                  />
                  <div className="w-4 h-4 border-2 border-white/30 rounded flex items-center justify-center peer-checked:bg-turf-neon peer-checked:border-turf-neon transition-all">
                    {dontShowAgain && (
                      <CheckCircle size={10} className="text-black" />
                    )}
                  </div>
                </div>
                Don't show for today
              </label>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
}
