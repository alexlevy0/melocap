import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Hash, TrendingUp, Coins, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { Card } from "@/components/ui/card";

import { createClient as createServerClient } from "@/lib/supabase/server";
import { getNextDropDate, isWeekendActive, getSubmissionEndDate } from "@/lib/utils/weekend";

export default async function HomePage() {
  const t = await getTranslations("home");
  const tApp = await getTranslations("app");
  
  const supabase = await createServerClient(); // Await once
  
  // Logic to find current/next theme
  const { data: themes } = await supabase
    .from("weekly_themes")
    .select("*")
    .in("status", ["open", "locked", "resolving"])
    .order("created_at", { ascending: false })
    .limit(1);

  let theme = themes?.[0] || null;

  if (!theme) {
     const { data: upcoming } = await supabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "upcoming")
        .order("week_number", { ascending: true })
        .limit(1);
     theme = upcoming?.[0] || null;
  }

  const isWeekend = isWeekendActive();
  const nextDropDate = getNextDropDate();

  return (
    <main className="min-h-screen bg-slate-950 text-white selection:bg-primary-500/30">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary-600/20 rounded-full blur-[128px]" />
        </div>

        <div className="container mx-auto max-w-6xl relative">
          <div className="flex flex-col items-center text-center space-y-8 mb-16">
            <div className="space-y-4 max-w-3xl">
              <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
                {t("hero.title")}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                  {theme ? theme.title : t("hero.subtitle")}
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                {tApp("tagline")}
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 pt-4">
              {isWeekend ? (
                <Link href="/game/pod">
                  <Button
                    size="lg"
                    className="text-lg px-8 py-6 h-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40"
                  >
                    {t("cta.participate")}
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </Button>
                </Link>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <span className="text-slate-500 uppercase tracking-widest text-sm font-bold">
                    {t("countdown.title")}
                  </span>
                  <Countdown targetDate={nextDropDate} />
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 py-12">
            <StatCard icon={Hash} value="7" label={t("stats.players")} delay={100} />
            <StatCard icon={TrendingUp} value="50" label={t("stats.tracks")} delay={200} />
            <StatCard icon={Coins} value="100" label={t("stats.coins")} delay={300} />
          </div>

          {isWeekend && (
            <div className="w-full max-w-xl relative z-10 mx-auto mt-12">
              <div className="text-center mb-6">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">
                  {t("countdown.live")}
                </h2>
              </div>
              <Countdown targetDate={getSubmissionEndDate()} />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <Card className="flex flex-col items-center p-8 bg-slate-900/50 border-slate-800/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards" style={{ animationDelay: `${delay}ms` }}>
      <div className="p-3 bg-primary-500/10 rounded-2xl mb-4">
        <Icon className="w-6 h-6 text-primary-400" />
      </div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">{label}</div>
    </Card>
  );
}
