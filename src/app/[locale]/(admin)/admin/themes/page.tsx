
import { getThemes } from "@/app/actions/themes"; // We need to fix the import in themes.ts to allow client-side calling? No, this is a server component.
// Actually, server actions can be called from server components too.

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Calendar, Lock, Unlock, CheckCircle, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { Enums, Tables } from "@/types/database";
import { ThemeStatusActions } from "@/components/admin/ThemeStatusActions";

type ThemeStatus = Enums<"theme_status">;

// Map status to colors/icons
const statusConfig: Record<ThemeStatus, { color: string; icon: LucideIcon }> = {
  upcoming: { color: "text-slate-400 bg-slate-500/10", icon: Calendar },
  open: { color: "text-green-400 bg-green-500/10 w-full", icon: Unlock },
  locked: { color: "text-orange-400 bg-orange-500/10", icon: Lock },
  resolving: { color: "text-purple-400 bg-purple-500/10", icon: Lock },
  finished: { color: "text-blue-400 bg-blue-500/10", icon: CheckCircle },
};

import { getTranslations } from "next-intl/server";

export default async function AdminThemesPage() {
  const themes = await getThemes();
  const t = await getTranslations("admin.themes");
  const tPod = await getTranslations("pod.status");
  const tCommon = await getTranslations("common");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{t("title")}</h2>
        <Link href="/admin/themes/create">
          <Button variant="primary" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("new")}
          </Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {themes.map((theme: Tables<"weekly_themes">) => { 
           const status = statusConfig[theme.status as ThemeStatus] || statusConfig.upcoming;
           const Icon = status.icon;

           return (
            <Card key={theme.id} variant="flat" padding="md" className="bg-surface-800/50 border border-white/5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-mono text-xs text-slate-500">
                    W{theme.week_number}-{theme.year}
                  </span>
                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color} w-fit`}>
                    <Icon className="w-3 h-3" />
                    {tPod(theme.status)}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-white">{theme.title}</h3>
                {theme.description && (
                  <p className="text-sm text-slate-400">{theme.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                 <ThemeStatusActions themeId={theme.id} currentStatus={theme.status as ThemeStatus} />
                 <Button variant="secondary" size="sm" disabled>
                   {tCommon("edit")}
                 </Button>
              </div>
            </Card>
           );
        })}

        {themes.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-surface-900/50 rounded-xl border border-white/5">
            {t("empty")}
          </div>
        )}
      </div>
    </div>
  );
}
