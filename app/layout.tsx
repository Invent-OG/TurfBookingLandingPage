import "./globals.css";
import { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import Providers from "./providers";

import { db } from "@/db/db";
import { siteSettings } from "@/db/schema";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await db.select().from(siteSettings).limit(1);
    const companyName = settings[0]?.companyName || "TurfBook";
    const logoUrl =
      settings[0]?.logoUrl || "https://krpsportszone.com/logo.png";

    return {
      title: `${companyName} | Premium Turf Booking`,
      description: `Book your favorite sports arena with ${companyName}.`,
      icons: {
        icon: logoUrl,
        shortcut: logoUrl,
        apple: logoUrl,
      },
    };
  } catch (error) {
    console.warn(
      "Error fetching site settings for metadata (table might be missing):",
      error
    );
    return {
      title: "TurfBook | Premium Turf Booking",
      description: "Book your favorite sports arena with TurfBook.",
      icons: {
        icon: "https://krpsportszone.com/logo.png",
        shortcut: "https://krpsportszone.com/logo.png",
        apple: "https://krpsportszone.com/logo.png",
      },
    };
  }
}

import OfferPopup from "@/components/OfferPopup";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let settings;
  try {
    const res = await db.select().from(siteSettings).limit(1);
    settings = res[0];
  } catch (error) {
    console.warn("Failed to fetch settings for layout:", error);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-transparent text-white antialiased">
        <Providers>
          {children}
          <OfferPopup
            imageUrl={settings?.promoPopupImage}
            isActive={settings?.isPromoPopupActive || false}
            title={settings?.promoTitle}
            description={settings?.promoDescription}
            buttonText={settings?.promoButtonText}
            buttonLink={settings?.promoButtonLink}
            isButtonActive={settings?.isPromoButtonActive || false}
          />
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
