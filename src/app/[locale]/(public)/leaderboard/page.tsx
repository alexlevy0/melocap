import { useTranslations } from "next-intl";
import { LeaderboardPodium } from "@/components/leaderboard/LeaderboardPodium";
import { LeaderboardList } from "@/components/leaderboard/LeaderboardList";
import { UserRankBar } from "@/components/leaderboard/UserRankBar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Globe } from "lucide-react";

export default function LeaderboardPage() {
  const t = useTranslations("leaderboard");

  // Mock data - In real app, fetch from Supabase
  const leaders = [
    { rank: 1, name: "Melomaniac", reputation: 12500, wins: 12, avatar_url: null, trend: "Neon Dreams" },
    { rank: 2, name: "SilverFox", reputation: 8200, wins: 9, avatar_url: null, trend: "Cyber Love" },
    { rank: 3, name: "BronzeBeat", reputation: 7900, wins: 7, avatar_url: null, trend: "Bass Drop" },
    { rank: 4, name: "CryptoBeats", reputation: 4200, wins: 5, avatar_url: null, trend: "Solar Power" },
    { rank: 5, name: "LunaTick", reputation: 3950, wins: 4, avatar_url: null, trend: "Midnight City" },
    { rank: 6, name: "PixelPusher", reputation: 3820, wins: 3, avatar_url: null, trend: "Ghost" },
    { rank: 7, name: "SonicWave", reputation: 3400, wins: 2, avatar_url: null, trend: "Levitating" },
    { rank: 8, name: "BeatBoxer", reputation: 3150, wins: 2, avatar_url: null, trend: "Blinding Lights" },
    { rank: 9, name: "VibeChecker", reputation: 2900, wins: 1, avatar_url: null, trend: "Good 4 U" },
  ];

  const currentUser = {
    rank: 42,
    name: "You",
    reputation: 1200,
    avatar_url: null,
    trend: "Stay"
  };

  return (
    <main className="max-w-2xl mx-auto px-4 pb-32 space-y-6">
      
      {/* Header */}
      <header className="flex items-center justify-between pt-4">
        <h1 className="text-2xl font-display font-bold text-white">
          {t("title")}
        </h1>
        {/* Filter / Sort can go here */}
      </header>

      {/* Tabs */}
      <Tabs defaultValue="global" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/5 border border-white/5 p-1 rounded-full">
          <TabsTrigger value="global" className="rounded-full data-[state=active]:bg-primary-600 data-[state=active]:text-white">
            <Globe className="w-4 h-4 mr-2" /> {t("tabs.global")}
          </TabsTrigger>
          <TabsTrigger value="friends" className="rounded-full data-[state=active]:bg-primary-600 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" /> {t("tabs.friends")}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="global" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <LeaderboardPodium top3={leaders.slice(0, 3)} />
          
          <div className="px-2 pb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-2">{t("runners_up")}</h3>
            <LeaderboardList runnersUp={leaders.slice(3)} />
          </div>
        </TabsContent>
        
        <TabsContent value="friends">
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400">{t("empty_friends")}</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Sticky User Rank */}
      <UserRankBar userRank={currentUser} />
    </main>
  );
}
