
"use client";

import { createTheme } from "@/app/actions/themes";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateThemePage() {
  const t = useTranslations("admin.themes");
  const tCommon = useTranslations("common");
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/themes" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t("back_to_themes")}
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">{t("create_title")}</h1>
        <p className="text-slate-400">{t("create_subtitle")}</p>
      </div>

      <Card padding="lg" className="bg-surface-900/50 border border-white/5">
        <form action={createTheme} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium text-slate-300">
                {t("fields.year")}
              </label>
              <input 
                name="year" 
                id="year" 
                type="number" 
                defaultValue={new Date().getFullYear()}
                required
                className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="week_number" className="text-sm font-medium text-slate-300">
                {t("fields.week")}
              </label>
              <input 
                name="week_number" 
                id="week_number" 
                type="number" 
                defaultValue={getWeekNumber(new Date())}
                required
                className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-300">
                {t("fields.title")}
            </label>
            <input 
              name="title" 
              id="title" 
              type="text" 
              placeholder={t("fields.placeholder_title")}
              required
              className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">
                {t("fields.description")}
            </label>
            <textarea 
              name="description" 
              id="description" 
              rows={3}
              placeholder={t("fields.placeholder_description")}
              className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Link href="/admin/themes">
               <Button type="button" variant="ghost">{tCommon("cancel")}</Button>
             </Link>
             <Button type="submit" variant="primary">{t("create_cta")}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

// Helper for default week number
function getWeekNumber(d: Date) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return weekNo + 1; // Target next week by default
}
