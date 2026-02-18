import { useTranslations } from "next-intl";

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");

  // Mock data
  const leaders = [
    { rank: 1, name: "Melomaniac", reputation: 1250, wins: 12 },
    { rank: 2, name: "BeatHunter", reputation: 1100, wins: 9 },
    { rank: 3, name: "SonicSurfer", reputation: 980, wins: 7 },
    { rank: 4, name: "GrooveMaster", reputation: 850, wins: 5 },
    { rank: 5, name: "VinylJunkie", reputation: 720, wins: 4 },
  ];

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold gradient-text-primary">
          {t("title")}
        </h1>
        <p className="text-slate-400">{t("subtitle")}</p>
      </header>

      <div className="glass rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-medium text-slate-400">{t("rank")}</th>
                <th className="p-4 font-medium text-slate-400">{t("curator")}</th>
                <th className="p-4 font-medium text-slate-400 text-right">{t("reputation")}</th>
                <th className="p-4 font-medium text-slate-400 text-right">{t("predictions")}</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((leader) => (
                <tr key={leader.rank} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 font-display font-bold text-lg">
                    {leader.rank === 1 && "🥇"}
                    {leader.rank === 2 && "🥈"}
                    {leader.rank === 3 && "🥉"}
                    {leader.rank > 3 && `#${leader.rank}`}
                  </td>
                  <td className="p-4 font-bold text-white">{leader.name}</td>
                  <td className="p-4 text-right font-mono text-accent-400 font-bold">
                    {leader.reputation}
                  </td>
                  <td className="p-4 text-right text-slate-300">
                    {leader.wins}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
