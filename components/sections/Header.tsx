"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Menu, X } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<HTMLLIElement[]>([]);

  const [branding, setBranding] = useState<{
    companyName: string;
    logoUrl: string | null;
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setBranding(data);
        }
      })
      .catch((err) => console.error("Failed to load branding", err));
  }, []);

  // Detect scroll event
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.fromTo(
        menuRef.current,
        { x: "100%" },
        { x: "0%", duration: 0.5, ease: "power3.out" }
      );
      gsap.fromTo(
        linksRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, stagger: 0.1, delay: 0.2 }
      );
    } else {
      document.body.style.overflow = "";
      gsap.to(menuRef.current, { x: "100%", duration: 0.5, ease: "power3.in" });
    }
  }, [menuOpen]);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "Testimonials", path: "/#testimonials" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 w-full p-4 lg:px-10 flex justify-between items-center text-white z-50 transition-all duration-300",
          scrolled
            ? "h-20 bg-turf-dark/80 backdrop-blur-md border-b border-white/5 shadow-glass"
            : "h-24 bg-transparent"
        )}
      >
        <div className="flex items-center gap-2">
          {branding?.logoUrl ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-neon-green border border-turf-neon/20">
              <Image
                src={branding.logoUrl}
                alt={branding.companyName}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-turf-neon flex items-center justify-center shadow-neon-green">
              <span className="text-turf-dark font-bold text-xl">
                {branding?.companyName ? branding.companyName.charAt(0) : "T"}
              </span>
            </div>
          )}

          <span className="text-2xl font-bold font-heading tracking-wider flex gap-1">
            {branding?.companyName ? (
              <span className="text-white">{branding.companyName}</span>
            ) : (
              <>
                TURF<span className="text-turf-neon">BOOK</span>
              </>
            )}
          </span>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white z-50 md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          {menuOpen ? (
            <X size={28} className="text-turf-neon" />
          ) : (
            <Menu size={28} />
          )}
        </button>

        <nav className="hidden md:flex gap-8">
          <ul className="flex gap-8 text-sm font-medium tracking-wide uppercase">
            {navItems.map((item, index) => (
              <li key={index}>
                <a
                  href={item.path}
                  className="relative group py-2 hover:text-turf-neon transition-colors"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-turf-neon transition-all duration-300 group-hover:w-full shadow-neon-green"></span>
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/admin/login"
            className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 text-xs font-bold uppercase tracking-wider hover:bg-turf-neon hover:text-turf-dark hover:border-turf-neon transition-all duration-300"
          >
            Admin Login
          </a>
        </nav>

        {/* Mobile Menu Overlay */}
        <nav
          ref={menuRef}
          className="fixed top-0 right-0 w-full h-screen bg-turf-dark/95 backdrop-blur-xl border-l border-white/10 flex flex-col justify-center items-center gap-8 transform translate-x-full md:hidden z-40"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_rgba(204,255,0,0.1),_transparent_70%)] pointer-events-none" />

          <ul className="text-3xl font-heading space-y-6 text-center relative z-10">
            {navItems.map((item, index) => (
              <li
                key={index}
                ref={(el) => {
                  if (el) linksRef.current[index] = el;
                }}
              >
                <a
                  href={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block hover:text-turf-neon transition-colors"
                >
                  {item.name}
                </a>
              </li>
            ))}
          </ul>

          <div className="relative z-10 mt-8">
            <a
              href="/admin/login"
              className="px-8 py-3 rounded-xl bg-turf-neon text-turf-dark font-bold hover:shadow-neon-green transition-all"
            >
              Admin Login
            </a>
          </div>
        </nav>
      </header>

      {/* Mobile Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
}
