"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";
import { User } from "lucide-react";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full border border-white/10 bg-surface-800 transition-all duration-200",
  {
    variants: {
      size: {
        sm: "h-8 w-8",
        md: "h-10 w-10",
        lg: "h-14 w-14",
        xl: "h-20 w-20",
      },
      status: {
        online: "ring-2 ring-green-500 ring-offset-2 ring-offset-surface-900",
        offline: "",
        pod: "ring-2 ring-primary-500 ring-offset-2 ring-offset-surface-900",
      }
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string | null;
  fallback?: string;
  alt?: string;
}

function Avatar({ className, size, status, src, fallback, alt, ...props }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <div className={cn(avatarVariants({ size, status, className }))} {...props}>
      {src && !hasError ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="aspect-square h-full w-full object-cover"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-700 text-slate-400">
          {fallback ? (
            <span className="font-semibold text-white/90 uppercase">
              {fallback.slice(0, 2)}
            </span>
          ) : (
            <User className="h-[50%] w-[50%]" />
          )}
        </div>
      )}
    </div>
  );
}

export { Avatar, avatarVariants };
