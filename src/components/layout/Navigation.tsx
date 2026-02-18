"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavLink } from "@/components/ui/nav-link";
import { Home, Trophy, BarChart3, User, Disc } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";

export function Navigation() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      {/* Desktop Navigation (Top Bar) */}
      <header className="fixed top-0 left-0 right-0 z-50 hidden md:block border-b border-white/5 bg-surface-900/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center">
              <Disc className="w-5 h-5 text-white animate-spin-slow" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">
              Melo<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Caps</span>
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink href="/" icon={Home} label={t("home")} />
            <NavLink href="/leaderboard" icon={Trophy} label={t("leaderboard")} />
            <NavLink href="/results" icon={BarChart3} label={t("results")} />
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <Link href="/profile" className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full glass hover:bg-white/10 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-white/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary-300" />
                </div>
                <span className="text-sm font-medium text-slate-200">
                  {t("profile")}
                </span>
              </Link>
            ) : (
              <Link href="/login" className="btn-primary text-sm py-2 px-4 shadow-lg shadow-primary-500/20">
                {tAuth("login")}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Bottom Tab Bar) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-900/90 backdrop-blur-xl border-t border-white/5 pb-safe-area">
        <div className="flex items-center justify-around px-2 py-3">
          <NavLink href="/" icon={Home} label={t("home")} />
          <NavLink href="/leaderboard" icon={Trophy} label={t("leaderboard")} />
          <NavLink href="/results" icon={BarChart3} label={t("results")} />
          <NavLink href={user ? "/profile" : "/login"} icon={User} label={user ? t("profile") : tAuth("login")} />
        </div>
      </nav>
    </>
  );
}
