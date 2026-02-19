"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface StakeSliderProps {
  label: string;
  subLabel?: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  className?: string;
  disabled?: boolean;
}

export function StakeSlider({
  label,
  subLabel,
  value,
  max,
  onChange,
  className,
  disabled
}: StakeSliderProps) {
  return (
    <div className={cn("space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5 transition-all hover:bg-white/10", className)}>
      <div className="flex justify-between items-start mb-1">
        <div className="flex flex-col">
          <span className="font-bold text-white text-sm line-clamp-1">{label}</span>
          {subLabel && <span className="text-xs text-slate-500 line-clamp-1">{subLabel}</span>}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-primary-500/10 rounded-full border border-primary-500/20">
          <span className="text-xs font-mono font-bold text-primary-400">{value}</span>
        </div>
      </div>
      
      <Slider
        value={[value]}
        max={max + value} // Can increase by remaining + what is already put here
        step={1}
        onValueChange={(vals: number[]) => onChange(vals[0])}
        disabled={disabled}
        className="py-4 touch-none" 
      />
    </div>
  );
}
