"use client";

import { useTransition } from "react";
import { ThemeStatus } from "@/types/database";
import { updateThemeStatus } from "@/app/actions/themes";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Play, Lock, Sparkles, Check } from "lucide-react";

interface ThemeStatusActionsProps {
  themeId: string;
  currentStatus: ThemeStatus;
}

export function ThemeStatusActions({ themeId, currentStatus }: ThemeStatusActionsProps) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations("admin.themes.actions");

  const handleStatusUpdate = (newStatus: ThemeStatus) => {
    startTransition(async () => {
      try {
        await updateThemeStatus(themeId, newStatus);
      } catch (error) {
        console.error("Failed to update status:", error);
      }
    });
  };

  if (currentStatus === "upcoming") {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => handleStatusUpdate("open")}
        disabled={isPending}
        className="text-green-400 border-green-500/20 hover:bg-green-500/10"
      >
        <Play className="w-3 h-3 mr-2" />
        {t("open")}
      </Button>
    );
  }

  if (currentStatus === "open") {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => handleStatusUpdate("locked")}
        disabled={isPending}
        className="text-orange-400 border-orange-500/20 hover:bg-orange-500/10"
      >
        <Lock className="w-3 h-3 mr-2" />
        {t("lock")}
      </Button>
    );
  }

  if (currentStatus === "locked") {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => handleStatusUpdate("resolving")}
        disabled={isPending}
        className="text-purple-400 border-purple-500/20 hover:bg-purple-500/10"
      >
        <Sparkles className="w-3 h-3 mr-2" />
        {t("resolve")}
      </Button>
    );
  }

  if (currentStatus === "resolving") {
    return (
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => handleStatusUpdate("finished")}
        disabled={isPending}
        className="text-blue-400 border-blue-500/20 hover:bg-blue-500/10"
      >
        <Check className="w-3 h-3 mr-2" />
        {t("finish")}
      </Button>
    );
  }

  return null;
}
