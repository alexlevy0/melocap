import { useTranslations } from "next-intl";

export default function ResultsPage() {
  const t = useTranslations("results");

  // Mock data for Top 50 (just top 5 for demo)
  const topTracks = [
    { rank: 1, title: "Midnight City", artist: "M83", score: 450, backers: 42 },
    { rank: 2, title: "Get Lucky", artist: "Daft Punk", score: 410, backers: 38 },
    { rank: 3, title: "Instant Crush", artist: "Daft Punk", score: 390, backers: 35 },
    { rank: 4, title: "Safe and Sound", artist: "Capital Cities", score: 350, backers: 30 },
    { rank: 5, title: "Electric Feel", artist: "MGMT", score: 320, backers: 28 },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold gradient-text-secondary">
          {t("title", { week: 42 })}
        </h1>
        <p className="text-slate-400">The Drop #42</p>
      </header>

      <div className="space-y-4">
        {topTracks.map((track) => (
          <div key={track.rank} className="glass rounded-2xl p-4 flex items-center gap-4 hover:scale-[1.01] transition-transform">
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center font-display font-bold text-2xl text-white/20">
              #{track.rank}
            </div>
            
            {/* Fake Album Art */}
            <div className="w-16 h-16 rounded-lg bg-surface-800 flex-shrink-0 animate-pulse bg-gradient-to-br from-surface-700 to-surface-800" />

            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white truncate">{track.title}</h3>
              <p className="text-sm text-slate-400 truncate">{track.artist}</p>
            </div>

            <div className="text-right flex-shrink-0">
              <p className="font-bold text-secondary-400">{t("score", { score: track.score })}</p>
              <p className="text-xs text-slate-500">{t("backers", { count: track.backers })}</p>
            </div>
          </div>
        ))}
        
        <div className="text-center text-slate-500 py-8 italic">
          ... and 45 more tracks
        </div>
      </div>
    </main>
  );
}
