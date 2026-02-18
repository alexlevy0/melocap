import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils/cn";

const cardVariants = cva(
  "rounded-3xl border border-white/5 bg-surface-900/40 backdrop-blur-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "shadow-xl shadow-black/20",
        hover: "hover:bg-surface-800/60 hover:border-white/10 hover:shadow-2xl hover:shadow-primary-500/5 hover:-translate-y-1",
        flat: "bg-transparent border-none shadow-none",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding, className }))}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export { Card, cardVariants };
