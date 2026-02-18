import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { PerformanceSummary } from "@/components/game/PerformanceSummary";
import { Top50List } from "@/components/game/Top50List";

import { WeeklyResults } from "@/lib/game-engine/resolve";

export default async function ResultsPage() {
  const t = await getTranslations("results");
  const supabase = await createClient();

  // 1. Get the latest finished theme
  const { data: theme } = await supabase
    .from("weekly_themes")
    .select("*")
    .eq("status", "finished")
    .order("resolved_at", { ascending: false })
    .limit(1)
    .single();

  if (!theme) {
    return (
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-display font-bold gradient-text-secondary mb-4">
          {t("title", { week: "?" })}
        </h1>
        <p className="text-slate-400">{t("noResults")}</p>
      </main>
    );
  }

  // 2. Get user info for performance
  const { data: { user } } = await supabase.auth.getUser();
  
  let personalStats = {
    earned: 0,
    burned: 0,
    reputationDelta: 0,
    successRate: 0
  };

  if (user) {
    // Fetch user stakes for this theme directly using the denormalized theme_id
    const { data: userStakes } = await supabase
      .from("stakes")
      .select(`
        id,
        amount,
        payout,
        result
      `)
      .eq("user_id", user.id)
      .eq("theme_id", theme.id);

    if (userStakes && userStakes.length > 0) {
      personalStats.earned = userStakes.reduce((sum, s) => sum + (s.payout || 0), 0);
      
      // Fix: Burned only includes LOST stakes
      personalStats.burned = userStakes
        .filter(s => s.result !== "won")
        .reduce((sum, s) => sum + s.amount, 0);
      
      const wins = userStakes.filter(s => s.result === "won").length;
      personalStats.successRate = wins / userStakes.length;
      
      // Reputation delta: +10 per win, -5 per loss
      const losses = userStakes.length - wins;
      personalStats.reputationDelta = (wins * 10) - (losses * 5);
    }
  }

  // 3. Extract Top 50 from JSON with Strict Typing
  const resultsData = theme.results_json as unknown as WeeklyResults | null;
  const topTracks = resultsData?.top50 || [];

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-12">
      <header className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-display font-black gradient-text-secondary tracking-tight">
          {t("title", { week: theme.week_number })}
        </h1>
        <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">
            {theme.title} — {new Date(theme.resolved_at!).toLocaleDateString()}
        </p>
      </header>

      {user && (
        <section className="space-y-6">
          <h2 className="text-xl font-display font-bold text-white px-1">
            {t("myPredictions")}
          </h2>
          <PerformanceSummary 
            earned={personalStats.earned}
            burned={personalStats.burned}
            reputationDelta={personalStats.reputationDelta}
            successRate={personalStats.successRate}
          />
        </section>
      )}

      <section className="pt-4">
        <Top50List tracks={topTracks} />
      </section>
    </main>
  );
}
