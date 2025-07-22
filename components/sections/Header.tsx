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
    <header
      className={cn(
        "fixed top-0 left-0 w-full  p-2 px-4 lg:px-52   flex justify-between items-center text-white z-50",
        scrolled ? "bg-primary/60 backdrop-blur-sm" : "bg-transparent"
      )}
    >
      {/* <Image
        src={"/images/Logo/Temple city logo .webp"}
        alt={""}
        width={65}
        height={65}
      /> */}
      Turff book
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="text-white z-50 md:hidden"
      >
        {menuOpen ? <X size={32} /> : <Menu size={32} />}
      </button>
      <nav className="hidden md:flex gap-6">
        <ul className="flex gap-6 text-lg">
          {navItems.map((item, index) => (
            <li key={index}>
              <a href={item.path} className="hover:opacity-70">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <nav
        ref={menuRef}
        className="fixed top-0 right-0 w-full h-screen bg-black text-white flex flex-col justify-center items-center gap-6 transform translate-x-full md:hidden"
      >
        <ul className="text-2xl space-y-4">
          {navItems.map((item, index) => (
            <li
              key={index}
              ref={(el) => {
                if (el) linksRef.current[index] = el;
              }}
            >
              <a href={item.path} className="hover:opacity-70">
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
