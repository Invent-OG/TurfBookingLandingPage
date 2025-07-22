"use client";

import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import FloatingButtons from "@/components/FloatingButtons";
import InstagramEmbed from "@/components/InstagramEmbed";
import { BlurFadeDemo } from "@/components/MagicUiImageGallery/main";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import TurfImageGallery from "@/components/sections/TurfGallery";
import GetInTouch from "@/components/sections/GetInTouch";

export default function Home() {

  console.log("test")
  return (
    <main className="relative h-screen  w-full ">
      <Header />
      <HeroCarousel />
      <BlurFadeDemo />
      <Features />
      <TurfImageGallery />
      <InstagramEmbed />
      <Testimonials />
      <GetInTouch />
      <Footer />
      <FloatingButtons />
    </main>
  );
}
