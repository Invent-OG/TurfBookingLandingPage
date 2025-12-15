import TapedFooter from "@/components/sections/TapedFooter";
import TubelightHeader from "@/components/sections/TubelightHeader";
import { HeroCarousel } from "@/components/sections/HeroCarousel";
import FloatingButtons from "@/components/FloatingButtons";
import InstagramEmbed from "@/components/InstagramEmbed";
import { BlurFadeDemo } from "@/components/MagicUiImageGallery/main";
import Features from "@/components/sections/Features";
import Testimonials from "@/components/sections/Testimonials";
import TurfImageGallery from "@/components/sections/TurfGallery";
import GetInTouch from "@/components/sections/GetInTouch";
// Global background component
import { GlobalBackground } from "@/components/ui/global-background";

import { EventBanner } from "@/components/sections/EventBanner";
import { HomeEvents } from "@/components/sections/HomeEvents";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full text-white selection:bg-turf-neon/30 selection:text-turf-neon overflow-x-hidden">
      <GlobalBackground />
      <div className="relative z-10">
        <EventBanner />
        <TubelightHeader />
        <HeroCarousel />
        <HomeEvents />
        <TurfImageGallery />
        <BlurFadeDemo />
        <Features />
        <Testimonials />
        <InstagramEmbed />
        <GetInTouch />
        <TapedFooter />
        <FloatingButtons />
      </div>
    </main>
  );
}
