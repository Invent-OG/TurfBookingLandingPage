"use client";

import { useState, useEffect } from "react";

interface SiteSettings {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  logoUrl: string | null;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    companyName: "TurfBook",
    supportEmail: "support@turfbook.com",
    supportPhone: "+91 88838 88025",
    logoUrl: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings({
            companyName: data.companyName || "TurfBook",
            supportEmail: data.supportEmail || "support@turfbook.com",
            supportPhone: data.supportPhone || "+91 88838 88025",
            logoUrl: data.logoUrl || null,
          });
        }
      })
      .catch((err) => console.error("Failed to load settings", err))
      .finally(() => setLoading(false));
  }, []);

  return { settings, loading };
}
