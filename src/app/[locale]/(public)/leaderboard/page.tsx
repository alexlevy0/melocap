import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");

  // Mock data
  const leaders = [
    { rank: 1, name: "Melomaniac", reputation: 1250, wins: 12, avatar: null },
    { rank: 2, name: "BeatHunter", reputation: 1100, wins: 9, avatar: null },
    { rank: 3, name: "SonicSurfer", reputation: 980, wins: 7, avatar: null },
    { rank: 4, name: "GrooveMaster", reputation: 850, wins: 5, avatar: null },
    { rank: 5, name: "VinylJunkie", reputation: 720, wins: 4, avatar: null },
  ];

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge variant="glow" className="text-sm px-3 py-1">🥇 #1</Badge>;
    if (rank === 2) return <Badge variant="secondary" className="text-sm px-3 py-1">🥈 #2</Badge>;
    if (rank === 3) return <Badge variant="secondary" className="text-sm px-3 py-1">🥉 #3</Badge>;
    return <span className="font-display font-medium text-slate-400">#{rank}</span>;
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-display font-bold gradient-text-primary">
          {t("title")}
        </h1>
        <p className="text-slate-400">{t("subtitle")}</p>
      </header>

      <Card className="overflow-hidden">
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
                  <td className="p-4">
                    {getRankBadge(leader.rank)}
                  </td>
                  <td className="p-4 flex items-center gap-3">
                    <Avatar fallback={leader.name} />
                    <span className="font-bold text-white">{leader.name}</span>
                  </td>
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
      </Card>
    </main>
  );
}
