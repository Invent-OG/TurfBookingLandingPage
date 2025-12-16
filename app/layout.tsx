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

    return {
      title: `${companyName} | Premium Turf Booking`,
      description: `Book your favorite sports arena with ${companyName}.`,
    };
  } catch (error) {
    console.warn(
      "Error fetching site settings for metadata (table might be missing):",
      error
    );
    return {
      title: "TurfBook | Premium Turf Booking",
      description: "Book your favorite sports arena with TurfBook.",
    };
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-transparent text-white antialiased">
        <Providers>
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
