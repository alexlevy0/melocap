"use client";

import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Target, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerformanceSummaryProps {
  earned: number;
  burned: number;
  reputationDelta: number;
  successRate: number;
}

export function PerformanceSummary({
  earned,
  burned,
  reputationDelta,
  successRate,
}: PerformanceSummaryProps) {
  const t = useTranslations("results");
  const profit = earned - burned;
  const isProfit = profit >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      {/* Profit/Loss Card */}
      <Card className="p-6 glass-strong border-primary-500/20 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
          <Coins className="w-12 h-12 text-primary-400" />
        </div>
        <p className="text-sm text-slate-400 font-medium mb-1">
          {isProfit ? t("profit") : t("loss")}
        </p>
        <div className="flex items-end gap-2">
          <span className={cn(
            "text-3xl font-display font-bold",
            isProfit ? "text-green-400" : "text-secondary-400"
          )}>
            {isProfit ? "+" : ""}{profit}
          </span>
          <span className="text-sm text-slate-500 mb-1 font-mono">Coins</span>
        </div>
      </Card>

      {/* Earned vs Burned */}
      <Card className="p-6 glass border-white/5">
        <p className="text-sm text-slate-400 font-medium mb-3">{t("myPredictions")}</p>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ArrowUpRight className="w-3.5 h-3.5 text-green-500" /> {t("earned")}
            </span>
            <span className="font-mono font-bold text-green-400">+{earned}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 flex items-center gap-1.5">
              <ArrowDownRight className="w-3.5 h-3.5 text-secondary-500" /> {t("burned")}
            </span>
            <span className="font-mono font-bold text-secondary-400">-{burned}</span>
          </div>
        </div>
      </Card>

      {/* Reputation Delta */}
      <Card className="p-6 glass border-white/5 flex flex-col justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">{t("reputationChange")}</p>
          <div className="flex items-center gap-2">
            <TrendingUp className={cn(
              "w-5 h-5",
              reputationDelta >= 0 ? "text-cyan-400" : "text-red-400"
            )} />
            <span className={cn(
              "text-2xl font-display font-bold",
              reputationDelta >= 0 ? "text-cyan-400" : "text-red-400"
            )}>
              {reputationDelta >= 0 ? "+" : ""}{reputationDelta}
            </span>
          </div>
        </div>
      </Card>

      {/* Success Rate */}
      <Card className="p-6 glass border-white/5 flex flex-col justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium mb-1">{t("successRate")}</p>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary-400" />
            <span className="text-2xl font-display font-bold text-primary-100">
              {Math.round(successRate * 100)}%
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
