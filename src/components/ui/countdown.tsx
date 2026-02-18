"use client";

import * as React from "react";
import { cn } from "@/lib/utils/cn";
import { useTranslations } from "next-intl";

interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  targetDate?: Date; // Optional, defaults to next Friday 19h if not set (logic to be added later)
}

export function Countdown({ className, targetDate, ...props }: CountdownProps) {
  const t = useTranslations("home.countdown"); // Reusing home strings for now, or move to common
  // For demo, we just show static or simple relative time if passed, 
  // but "The Drop" logic is specific. 
  // Let's implement the standard specialized countdown for the "Drop".
  
  // Hardcoded target for demo: Next Sunday 19:00
  // In real app, this should come from API (Game Engine)
  
  // Logic from HomePage (mocked for now)
  const [timeLeft, setTimeLeft] = React.useState({
    days: "02",
    hours: "14",
    minutes: "32",
    seconds: "45",
  });

  // Effect to tick would be here. Skipping complex implementation for this "UI Component" ticket, 
  // focusing on the structure.
  
  return (
    <div className={cn("grid grid-cols-4 gap-2 md:gap-4 text-center", className)} {...props}>
      <TimeUnit value={timeLeft.days} label={t("days")} />
      <TimeUnit value={timeLeft.hours} label={t("hours")} />
      <TimeUnit value={timeLeft.minutes} label={t("minutes")} />
      <TimeUnit value={timeLeft.seconds} label={t("seconds")} highlighted />
    </div>
  );
}

function TimeUnit({ value, label, highlighted }: { value: string; label: string; highlighted?: boolean }) {
  return (
    <div className="flex flex-col items-center p-2 md:p-4 rounded-2xl bg-surface-800/50 backdrop-blur border border-white/5">
      <span className={cn("text-2xl md:text-4xl font-display font-bold tabular-nums", highlighted ? "text-primary-400" : "text-white")}>
        {value}
      </span>
      <span className="text-[10px] md:text-xs uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </div>
  );
}
