import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  children: React.ReactNode;
  title?: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, children, title, action, noPadding = false, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-2xl overflow-hidden flex flex-col",
          className
        )}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-white/5">
            {typeof title === "string" ? (
              <h3 className="text-lg font-bold text-white tracking-wide font-heading">
                {title}
              </h3>
            ) : (
              title
            )}
            {action && <div>{action}</div>}
          </div>
        )}
        <div className={cn(noPadding ? "" : "p-6")}>{children}</div>
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";
