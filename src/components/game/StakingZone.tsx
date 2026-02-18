"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { StakeSlider } from "./StakeSlider";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tables } from "@/types/database";
import { saveStakes } from "@/app/actions/stakes";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface StakingZoneProps {
  podId: string;
  submissions: Tables<"submissions">[];
  initialStakes: Tables<"stakes">[];
  walletBalance: number;
}

export function StakingZone({
  podId,
  submissions,
  initialStakes,
  walletBalance
}: StakingZoneProps) {
  const t = useTranslations("pod");
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for stakes: Record<submissionId, amount>
  const [stakes, setStakes] = useState<Record<string, number>>(() => {
    const initialBySub: Record<string, number> = {};
    initialStakes.forEach(s => {
      initialBySub[s.submission_id] = s.amount;
    });
    return initialBySub;
  });

  const totalAllocated = useMemo(() => {
    return Object.values(stakes).reduce((sum, val) => sum + val, 0);
  }, [stakes]);

  const remainingBalance = walletBalance - totalAllocated;

  const handleUpdateStake = (submissionId: string, amount: number) => {
    setStakes(prev => ({
      ...prev,
      [submissionId]: amount
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const stakeArray = Object.entries(stakes).map(([submissionId, amount]) => ({
        submissionId,
        amount
      }));
      
      await saveStakes(podId, stakeArray);
      toast.success(t("actions.save_predictions_success") || "Predictions saved!");
    } catch (error) {
      console.error("Failed to save stakes:", error);
      toast.error(t("errors.generic"));
    } finally {
      setIsSaving(false);
    }
  };

  if (submissions.length === 0) return null;

  return (
    <Card variant="glass" padding="lg" className="w-full border-primary-500/20 bg-surface-900/60 backdrop-blur-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-white mb-2">
            {t("actions.staking_title")}
          </h2>
          <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
            {t("actions.staking_description")}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2 bg-surface-800/80 p-4 rounded-2xl border border-white/5 min-w-[200px]">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {t("actions.total_allocated", { amount: totalAllocated })}
          </span>
          <span 
            className={cn(
              "text-lg font-mono font-bold transition-colors",
              remainingBalance < 0 ? "text-red-400" : "text-primary-400"
            )}
          >
            {t("actions.remaining_balance", { amount: remainingBalance })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {submissions.map((track) => (
          <StakeSlider
            key={track.id}
            label={track.track_name}
            subLabel={track.artist_name}
            value={stakes[track.id] || 0}
            max={Math.max(0, remainingBalance)}
            onChange={(val) => handleUpdateStake(track.id, val)}
            disabled={isSaving}
          />
        ))}
      </div>

      <div className="mt-10 flex justify-end items-center gap-4">
        {remainingBalance < 0 && (
          <span className="text-sm font-medium text-red-400 animate-pulse">
            {t("errors.insufficientCoins")}
          </span>
        )}
        <Button 
          variant="primary" 
          size="lg" 
          onClick={handleSave} 
          disabled={isSaving || remainingBalance < 0}
          className="min-w-[200px] h-14 text-lg shadow-xl shadow-primary-500/20"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t("actions.saving")}
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              {t("actions.save_predictions")}
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
