"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Upload, Trash2, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  imageUrl: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch("/api/gallery");
      if (res.ok) {
        const data = await res.json();
        setImages(data);
      }
    } catch (error) {
      console.error("Failed to load images");
      toast.error("Failed to load gallery images");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const formData = new FormData();

    // Append all files with the same key "images"
    Array.from(files).forEach((file) => {
      formData.append("images", file);
    });

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message || "Images uploaded successfully!");
        fetchImages();
      } else {
        const data = await res.json();
        toast.error(data.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Error uploading images");
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (id: string, url: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(
        `/api/admin/gallery?id=${id}&url=${encodeURIComponent(url)}`,
        {
          method: "DELETE",
        }
      );

      if (res.ok) {
        toast.success("Image deleted");
        setImages((prev) => prev.filter((img) => img.id !== id));
      } else {
        toast.error("Failed to delete image");
      }
    } catch (error) {
      toast.error("Error deleting image");
    }
  };

  return (
    <div className="p-6 md:p-8 text-white max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-turf-neon to-white">
            Gallery Management
          </h1>
          <p className="text-gray-400">
            Manage images displayed in the "Explore Our Arena" section.
          </p>
        </div>

        <div>
          <input
            type="file"
            id="gallery-upload"
            accept="image/*"
            multiple // Allow multiple selection
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
          <label
            htmlFor="gallery-upload"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-turf-neon text-turf-dark font-bold rounded-xl hover:shadow-neon-green transition-all cursor-pointer ${
              uploading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Upload size={20} />
            )}
            {uploading ? "Uploading..." : "Upload Images"}
          </label>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 size={32} className="animate-spin text-turf-neon" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.length === 0 ? (
            <div className="col-span-full py-20 text-center border border-white/10 rounded-2xl bg-white/5 border-dashed">
              <ImageIcon size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400 text-lg">No images found</p>
              <p className="text-gray-600 text-sm">
                Upload images to get started
              </p>
            </div>
          ) : (
            images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10 hover:border-turf-neon/50 transition-all shadow-lg"
              >
                <Image
                  src={img.imageUrl}
                  alt="Gallery Image"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button
                    onClick={() => handleDelete(img.id, img.imageUrl)}
                    className="p-3 bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white rounded-lg border border-red-500/50 transition-all transform hover:scale-110"
                    title="Delete Image"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
