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
import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";

// Server Component (no 'use client')
export default async function Home() {
  // Fetch branding settings
  const settings = await db.select().from(siteSettings).limit(1);
  const companyName = settings[0]?.companyName || "TurfBook";
  const logoUrl = settings[0]?.logoUrl;

  return (
    <main className="relative min-h-screen w-full text-white selection:bg-turf-neon/30 selection:text-turf-neon overflow-x-hidden">
      <GlobalBackground />
      <div className="relative z-10">
        <TubelightHeader companyName={companyName} logoUrl={logoUrl} />
        <HeroCarousel />
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
