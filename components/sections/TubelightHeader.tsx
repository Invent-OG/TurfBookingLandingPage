"use client";

import { Home, Star, Phone, ShieldCheck, User } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

export default function TubelightHeader() {
  const navItems = [
    { name: "Home", url: "/", icon: Home },
    { name: "Features", url: "/#features", icon: Star },
    { name: "Reviews", url: "/#testimonials", icon: ShieldCheck },
    { name: "Contact", url: "/#contact", icon: Phone },
  ];

  return <NavBar items={navItems} />;
}
