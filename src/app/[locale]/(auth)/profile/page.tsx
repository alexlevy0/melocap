"use client";

import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Database } from "@/types/database";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Settings, Edit2, Wallet, TrendingUp, Users, Music, Zap, Star, Lock, Trophy, LucideIcon } from "lucide-react";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tCommon = useTranslations("common");
  const tCoins = useTranslations("coins");
  
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async () => {
    try {
      setLoading(true);
      const supabase = createClient();
      
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.warn("Error fetching profile:", error);
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-500"></div>
      </div>
    );
  }

  // Mock Data for UI Polish
  const badges = [
    { id: 1, name: "Trendsetter", icon: Music, color: "text-primary-400", bg: "bg-primary-500/20", unlocked: true },
    { id: 2, name: "Early Bird", icon: Zap, color: "text-secondary-400", bg: "bg-secondary-500/20", unlocked: true },
    { id: 3, name: "Chart Topper", icon: Star, color: "text-accent-400", bg: "bg-accent-500/20", unlocked: true },
    { id: 4, name: "Locked", icon: Lock, color: "text-slate-600", bg: "bg-slate-800/50", unlocked: false },
  ];

  const history = [
    { id: 1, title: "Solar Power", artist: "Lorde", date: "2 days ago", result: "+50", positive: true, cover: "/covers/solar.jpg" },
    { id: 2, title: "Dawn FM", artist: "The Weeknd", date: "5 days ago", result: "-20", positive: false, cover: "/covers/dawn.jpg" },
    { id: 3, title: "Midnight City", artist: "M83", date: "1 week ago", result: "+120", positive: true, cover: "/covers/midnight.jpg" },
  ];

  return (
    <main className="min-h-screen pb-24 md:pb-8 p-4 md:p-8 space-y-8 bg-gradient-to-b from-surface-950 to-black">
      {/* Header */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full pt-4">
        <h1 className="text-xl font-bold text-white">{t("title")}</h1>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-white/10">
          <Settings className="w-5 h-5 text-white" />
        </Button>
      </header>

      {profile && (
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (Identity + Stats) */}
          <div className="lg:col-span-4 space-y-8">
            {/* Identity */}
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-500 to-secondary-500 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                <div className="relative p-1 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500">
                   <Avatar
                    size="xl"
                    src={profile.avatar_url}
                    fallback={profile.display_name || "User"}
                    className="border-4 border-surface-950 w-32 h-32 md:w-40 md:h-40"
                    status="online"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary-500 text-white shadow-lg hover:scale-105 transition-transform">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {profile.display_name}
                </h2>
                <div className="flex items-center justify-center gap-2 text-primary-400 bg-primary-500/10 px-4 py-1.5 rounded-full inline-flex">
                  <Trophy className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wider uppercase">{t("level", { level: 12 })}</span>
                </div>
              </div>
            </div>

            {/* Stats Row (Stacked or Grid) */}
            <div className="grid grid-cols-3 gap-3">
              <StatsBlock 
                icon={Wallet} 
                value={profile.wallet_balance.toString()} 
                label={t("wallet")} 
                color="text-secondary-400"
              />
              <StatsBlock 
                icon={TrendingUp} 
                value="68%" 
                label={t("stats.success")} 
                color="text-accent-400"
              />
              <StatsBlock 
                icon={Users} 
                value="2" 
                label={t("stats.pods")} 
                color="text-primary-400"
              />
            </div>
          </div>

          {/* Right Column (Badges + History) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Badges Section */}
            <Card className="p-6 border-white/5 bg-surface-900/30">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">{t("badges.title")}</h3>
                <button className="text-xs text-primary-400 hover:text-primary-300 font-medium">{tCommon("viewAll")}</button>
              </div>
              <div className="flex flex-wrap gap-4 justify-start">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${badge.bg} border border-white/5 transition-transform hover:scale-110`}>
                      <badge.icon className={`w-7 h-7 ${badge.color}`} />
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium text-center leading-tight">{badge.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Predictions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">{t("history.title")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {history.map((item) => (
                  <Card key={item.id} variant="hover" padding="sm" className="group flex items-center gap-4 bg-surface-900/50 border-white/5 p-4">
                    <div className="w-14 h-14 rounded-xl bg-surface-800 flex-shrink-0 relative overflow-hidden shadow-lg">
                       {/* Mock Cover */}
                       <div className="absolute inset-0 bg-gradient-to-br from-surface-700 to-surface-900" />
                       <Music className="absolute inset-0 m-auto w-6 h-6 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base truncate group-hover:text-primary-400 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{item.artist}</p>
                      <p className="text-[10px] text-slate-500 mt-1">{t("history.curated", { date: item.date })}</p>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold text-lg ${item.positive ? 'text-secondary-400' : 'text-red-400'}`}>
                        {item.result}
                      </span>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{tCoins("meloCoins")}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </main>
  );
}

function StatsBlock({ icon: Icon, value, label, color }: { icon: LucideIcon, value: string, label: string, color: string }) {
  return (
    <Card className="flex flex-col items-center justify-center text-center gap-1 hover:bg-surface-800/40 transition-colors cursor-default border-white/5 bg-surface-900/40" padding="sm">
      <div className={`p-2 rounded-full bg-white/5 mb-1`}>
         <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <span className="text-xl font-display font-bold text-white">{value}</span>
      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">{label}</span>
    </Card>
  )
}
