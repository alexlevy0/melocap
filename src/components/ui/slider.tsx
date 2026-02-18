"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  className?: string;
  value: number[];
  max: number;
  min?: number;
  step?: number;
  disabled?: boolean;
  onValueChange?: (value: number[]) => void;
}

export function Slider({
  className,
  value,
  max,
  min = 0,
  step = 1,
  disabled,
  onValueChange,
}: SliderProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onValueChange?.([Number.parseInt(e.target.value, 10)]);
  };

  const percentage = ((value[0] - min) / (max - min)) * 100;

  return (
    <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-white/5">
        <div 
          className="absolute h-full bg-primary-500 transition-all" 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        onChange={handleChange}
        disabled={disabled}
        className={cn(
          "absolute inset-0 h-2 w-full cursor-pointer opacity-0",
          disabled && "cursor-not-allowed"
        )}
      />
      {/* Visual Thumb representation */}
      <div 
        className={cn(
          "absolute h-5 w-5 rounded-full border-2 border-primary-500 bg-surface-900 shadow transition-all pointer-events-none",
          disabled && "border-slate-700 bg-slate-800"
        )}
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  );
}
