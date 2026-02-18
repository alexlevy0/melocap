import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { Card } from "@/components/ui/card";

import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tApp = await getTranslations("app");
  
  const supabase = createServerClient();
  
  // Logic to find current/next theme (same as API logic, allowing code reuse if extracted)
  // For now duplicate valid logic for speed or verify if API allows internal call? 
  // Direct DB access is better here.
  
  let { data: theme } = await (await supabase)
    .from("weekly_themes")
    .select("*")
    .in("status", ["open", "locked", "resolving"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!theme) {
     const { data: upcoming } = await (await supabase)
        .from("weekly_themes")
        .select("*")
        .eq("status", "upcoming")
        .order("week_number", { ascending: true })
        .limit(1)
        .single();
     theme = upcoming;
  }

  // Determine target date based on status
  // - Upcoming -> opens at Friday 19h (opened_at or calc from week_number?)
  // - Open -> locks at Sunday 12h
  // - Locked -> resolves at Sunday 19h
  // - Resolving -> finished
  
  // For MVP, we use the fields if set, or fallback to manual admin trigger concept.
  // Actually, S2-02 says "Theme Status Logic (Time-based or Manual)". 
  // If manual, we might not have a precise target date unless we set it.
  // But let's assume standard schedule for the countdown visual.
  // Friday 19:00 Paris = Upcoming Target
  // Sunday 12:00 Paris = Open Target
  // Sunday 19:00 Paris = Locked Target
  
  // Simple heuristic for visual "target":
  // If upcoming => Count to Fri 19h of that week
  // If open => Count to Sun 12h
  // If locked => Count to Sun 19h

  let targetDate: Date | undefined;
  let statusKey = "upcoming";

  if (theme) {
    statusKey = (theme as any).status; 
    // We need a helper to calculate dates from week_number/year if fields are null.
    // For now, if opened_at/locked_at are null, show generic or "Soon".
    // But let's try to use the timestamp if available?
    // Actually, we can just say:
    // Upcoming -> "Next Drop in..."
    // Open -> "Submissions close in..."
  }

  return (
    <main className="flex flex-col items-center justify-center p-4 min-h-[80vh] text-center space-y-12">
      
      {/* Hero Section */}
      <div className="space-y-6 max-w-4xl relative z-10">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="relative text-5xl md:text-8xl font-display font-bold tracking-tight">
          <span className="text-white">Melo</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Caps</span>
        </h1>
        
        <p className="relative text-xl md:text-3xl text-slate-300 font-light max-w-2xl mx-auto">
          {tApp("tagline")}
        </p>
        
        <p className="relative text-slate-400 max-w-lg mx-auto leading-relaxed text-base md:text-lg">
          {tApp("description")}
        </p>

        {theme && (
          <div className="py-2">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800/80 border border-white/10 backdrop-blur-md">
                <span className="text-primary-400 text-sm font-bold uppercase tracking-wider">
                  {statusKey === 'upcoming' ? t("theme.upcoming") : t("theme.current")}:
                </span>
                <span className="text-white font-medium">
                  {(theme as any).title}
                </span>
             </div>
          </div>
        )}

        <div className="relative pt-4 flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link href="/game/pod">
            <Button size="lg" className="text-lg px-8 py-6 h-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40">
              {(theme as any)?.status === 'open' ? t("cta.participate") : t("countdown.join")}
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
          </Link>
          
          <Link href="/results">
            <Button variant="ghost" size="lg" className="text-slate-400 hover:text-white text-lg h-auto px-8 py-6">
              {t("cta.discover")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Countdown */}
      <div className="w-full max-w-xl relative z-10">
        <div className="text-center mb-6">
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
             {(theme as any)?.status === 'open' ? t("countdown.live") : t("countdown.title")}
          </h2>
        </div>
        {/* We pass a fixed date for now or null to show zeros, as logic to calc exact date from week number is complex without a helper library like date-fns */}
        <Countdown className="gap-4 md:gap-8" targetDate={undefined} /> 
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-7xl px-4">
        <StatCard value="120+" label="Curators" delay={0} />
        <StatCard value="450" label="Tracks" delay={100} />
        <StatCard value="12k" label="MeloCoins" delay={200} />
      </div>

    </main>
  );
}

function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <Card 
      variant="hover"
      className="flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-3xl font-display font-bold text-white">
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-slate-500 mt-1">
        {label}
      </span>
    </Card>
  );
}
