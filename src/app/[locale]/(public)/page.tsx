import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

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
          <Link 
            href="/login" 
            className="btn-primary flex items-center gap-2 py-4 px-8 text-lg hover:scale-105 transition-transform"
          >
            {t("cta.participate")}
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link 
            href="/results" 
            className="text-slate-400 hover:text-white transition-colors underline-offset-4 hover:underline"
          >
            {t("cta.discover")}
          </Link>
        </div>
      </div>

      {/* Countdown / Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        <StatCard value="120+" label="Curators" delay={0} />
        <StatCard value="450" label="Tracks" delay={100} />
        <StatCard value="42h" label={t("countdown.title")} delay={200} highlighted />
        <StatCard value="12k" label="MeloCoins" delay={300} />
      </div>

    </main>
  );
}

function StatCard({ value, label, delay, highlighted = false }: { value: string; label: string; delay: number; highlighted?: boolean }) {
  return (
    <div 
      className={`glass rounded-2xl p-6 flex flex-col items-center justify-center animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards ${highlighted ? 'border-primary-500/50 bg-primary-500/5' : ''}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className={`text-3xl font-display font-bold ${highlighted ? 'gradient-text-primary' : 'text-white'}`}>
        {value}
      </span>
      <span className="text-xs uppercase tracking-wider text-slate-500 mt-1">
        {label}
      </span>
    </div>
  );
}
