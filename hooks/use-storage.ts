import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

import imageCompression from "browser-image-compression";

export const useUploadFile = () => {
  return useMutation({
    mutationFn: async ({
      file,
      bucket,
      path,
    }: {
      file: File;
      bucket: string;
      path?: string;
    }) => {
      // Compress image if it is an image file
      let uploadFile = file;
      if (file.type.startsWith("image/")) {
        try {
          const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          };
          uploadFile = await imageCompression(file, options);
        } catch (error) {
          console.warn(
            "Image compression failed, uploading original file:",
            error
          );
        }
      }

      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("bucket", bucket);
      if (path) formData.append("path", path);

      const res = await fetch("/api/storage", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Upload failed: ${res.statusText}`);
      }
      return res.json() as Promise<{ url: string; path: string }>;
    },
  });
};

export const useDeleteFile = () => {
  return useMutation({
    mutationFn: ({ bucket, path }: { bucket: string; path: string }) =>
      apiClient.delete("/api/storage", { bucket, path }),
  });
};
