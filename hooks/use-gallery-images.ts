import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export type GalleryImage = {
  id: string;
  imageUrl: string;
  createdAt: string;
};

export const useGalleryImages = () => {
  return useQuery({
    queryKey: ["gallery-images"],
    queryFn: async () => {
      const data = await apiClient.get<GalleryImage[]>("/api/gallery");
      return data || [];
    },
  });
};
