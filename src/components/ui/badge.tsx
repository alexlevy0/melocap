import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-500/10 text-primary-300 hover:bg-primary-500/20",
        secondary:
          "border-transparent bg-secondary-500/10 text-secondary-300 hover:bg-secondary-500/20",
        outline: "text-slate-400 border-slate-700",
        success:
          "border-transparent bg-green-500/10 text-green-400 hover:bg-green-500/20",
        warning:
          "border-transparent bg-orange-500/10 text-orange-400 hover:bg-orange-500/20",
        glow: "border-transparent bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-lg shadow-primary-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
