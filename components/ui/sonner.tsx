"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-turf-dark group-[.toaster]:text-white group-[.toaster]:border-white/10 group-[.toaster]:shadow-glass",
          description: "group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-turf-neon group-[.toast]:text-turf-dark font-bold",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-gray-400",
          success: "group-[.toaster]:border-turf-neon/50",
          error: "group-[.toaster]:border-red-500/50",
          info: "group-[.toaster]:border-blue-500/50",
          warning: "group-[.toaster]:border-yellow-500/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
