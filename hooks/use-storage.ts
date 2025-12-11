import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

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
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      if (path) formData.append("path", path);

      const res = await fetch("/api/storage", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to upload file");
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
