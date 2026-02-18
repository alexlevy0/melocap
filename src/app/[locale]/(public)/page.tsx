import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Countdown } from "@/components/ui/countdown";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const t = useTranslations("home");
  const tApp = useTranslations("app");

  return (
    <main className="flex flex-col items-center justify-center p-4 min-h-[80vh] text-center space-y-12">
      
      {/* Hero Section */}
      <div className="space-y-6 max-w-2xl relative">
        {/* Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary-500/20 blur-[100px] rounded-full pointer-events-none" />

        <h1 className="relative text-5xl md:text-7xl font-display font-bold tracking-tight">
          <span className="text-white">Melo</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Caps</span>
        </h1>
        
        <p className="relative text-xl md:text-2xl text-slate-300 font-light">
          {tApp("tagline")}
        </p>
        
        <p className="relative text-slate-400 max-w-lg mx-auto leading-relaxed">
          {tApp("description")}
        </p>

        <div className="relative pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/login">
            <Button size="lg" className="text-lg px-8 py-6">
              {t("cta.participate")}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <Link href="/results">
            <Button variant="ghost" size="lg" className="text-slate-400 hover:text-white text-lg">
              {t("cta.discover")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Countdown */}
      <div className="w-full max-w-2xl">
        <div className="text-center mb-4">
          <h2 className="text-xl font-display font-medium text-slate-400">{t("countdown.title")}</h2>
        </div>
        <Countdown />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 w-full max-w-4xl">
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
