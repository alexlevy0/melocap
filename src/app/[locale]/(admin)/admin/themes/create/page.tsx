
"use client";

import { createTheme } from "@/app/actions/themes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Need to check if Input exists, if not create basic input
import { Label } from "@/components/ui/label"; // Same for Label
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
// Next.js 15+ useActionState, possibly 14 uses useFormState. Checking package.json -> Next 16.1.6 
// In Next 16, useActionState is correct (renamed from useFormState)
// But to be safe with types, let's just use standard form action for now or verify imports.
// Wait, react-dom 19.2.3. useActionState is available in React 19.

export default function CreateThemePage() {
  
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/admin/themes" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Themes
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-white mb-2">New Weekly Theme</h1>
        <p className="text-slate-400">Set the stage for the next drop.</p>
      </div>

      <Card padding="lg" className="bg-surface-900/50 border border-white/5">
        <form action={createTheme} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="year" className="text-sm font-medium text-slate-300">Year</label>
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
              <label htmlFor="week_number" className="text-sm font-medium text-slate-300">Week Number</label>
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
            <label htmlFor="title" className="text-sm font-medium text-slate-300">Title</label>
            <input 
              name="title" 
              id="title" 
              type="text" 
              placeholder="e.g. Guilty Pleasures"
              required
              className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea 
              name="description" 
              id="description" 
              rows={3}
              placeholder="Briefly describe the restrictions..."
              className="w-full bg-surface-800 border-none rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3">
             <Link href="/admin/themes">
               <Button type="button" variant="ghost">Cancel</Button>
             </Link>
             <Button type="submit" variant="primary">Create Theme</Button>
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
