import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface SiteSettings {
  id?: string;
  companyName: string;
  logoUrl?: string | null;
  supportEmail?: string | null;
}

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ["site-settings"],
    queryFn: () => apiClient.get<SiteSettings>("/api/settings"),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
