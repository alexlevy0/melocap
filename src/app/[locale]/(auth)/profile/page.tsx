"use client";

import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Database } from "@/types/database";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, Wallet, Trophy } from "lucide-react";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export default function ProfilePage() {
  const t = useTranslations("profile");
  const tAuth = useTranslations("auth");

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

  return (
    <main className="min-h-screen p-4 md:p-8 space-y-8">
      <header className="flex justify-between items-center max-w-4xl mx-auto w-full">
        <h1 className="text-3xl font-display font-bold gradient-text-primary">
          {t("title")}
        </h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {tAuth("logout")}
        </Button>
      </header>

      {profile && (
        <div className="max-w-4xl mx-auto w-full grid gap-6 md:grid-cols-2">
          {/* Identity Card */}
          <Card className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500 rounded-full blur-xl opacity-20"></div>
              <Avatar
                size="xl"
                src={profile.avatar_url}
                fallback={profile.display_name || "User"}
                className="relative border-2 border-surface-700"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {profile.display_name}
              </h2>
              <p className="text-sm text-slate-400">@{profile.spotify_id}</p>
            </div>
          </Card>

          {/* Stats Card */}
          <div className="space-y-6">
            <Card className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-secondary-500" />
                  {t("wallet")}
                </p>
                <p className="text-3xl font-display font-bold text-secondary-400 mt-2">
                  {profile.wallet_balance}
                </p>
              </div>
            </Card>

            <Card className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-accent-500" />
                  {t("reputation")}
                </p>
                <p className="text-3xl font-display font-bold text-accent-400 mt-2">
                  {profile.reputation_score}
                </p>
              </div>
            </Card>
          </div>
        </div>
      )}
    </main>
  );
}
