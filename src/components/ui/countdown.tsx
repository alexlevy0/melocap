"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface CountdownProps extends React.HTMLAttributes<HTMLDivElement> {
  targetDate?: Date;
}

export function Countdown({ className, targetDate, ...props }: CountdownProps) {
  const t = useTranslations("home.countdown");
  
  const calculateTimeLeft = () => {
    // If no target date, return zeros
    if (!targetDate) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00" };
    }

    const difference = new Date(targetDate).getTime() - new Date().getTime();
    
    if (difference <= 0) {
      return { days: "00", hours: "00", minutes: "00", seconds: "00" };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)).toString().padStart(2, "0"),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24).toString().padStart(2, "0"),
      minutes: Math.floor((difference / 1000 / 60) % 60).toString().padStart(2, "0"),
      seconds: Math.floor((difference / 1000) % 60).toString().padStart(2, "0"),
    };
  };

  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);
  
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
