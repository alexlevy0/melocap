"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { NavLink } from "@/components/ui/nav-link";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Home, Trophy, BarChart3, User, Disc, LogIn } from "lucide-react";
import { WalletBadge } from "@/components/game/WalletBadge";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { type User as SupabaseUser } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export function Navigation() {
  const t = useTranslations("nav");
  const tAuth = useTranslations("auth");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

    // Handle scroll for desktop transparency effect
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Desktop Navigation (Top Bar) */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300 ease-in-out border-b border-transparent",
          scrolled ? "bg-bg/80 backdrop-blur-xl border-white/5 py-3" : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
               <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-lg group-hover:bg-primary-500/30 transition-all" />
               <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                 <Disc className="w-5 h-5 text-white/90 animate-spin-slow" />
               </div>
            </div>
            <span className="font-display font-bold text-2xl tracking-tight text-white group-hover:text-primary-100 transition-colors">
              Melo<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">Caps</span>
            </span>
          </Link>

          {/* Central Nav */}
          <nav className="flex items-center gap-2 p-1 rounded-full glass-subtle">
            <NavLink href="/" icon={Home} label={t("home")} />
            <NavLink href="/leaderboard" icon={Trophy} label={t("leaderboard")} />
            <NavLink href="/results" icon={BarChart3} label={t("results")} />
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-6">
            {user && <WalletBadge className="hidden lg:flex" />}
            
            {user ? (
              <Link href="/profile" className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-full glass hover:bg-white/10 hover:border-white/10 transition-all group">
                <Avatar 
                  size="sm" 
                  src={user.user_metadata.avatar_url} 
                  fallback={user.user_metadata.full_name || user.email} 
                  status="online"
                  className="ring-2 ring-white/10 group-hover:ring-primary-500/50 transition-all"
                />
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  {t("profile")}
                </span>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" className="shadow-lg shadow-primary-500/20 hover:shadow-primary-500/40 transition-all">
                  <LogIn className="w-4 h-4 mr-2" />
                  {tAuth("login")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation (Floating Bottom Dock) */}
      <nav className="fixed bottom-6 left-4 right-4 z-50 md:hidden">
        <div className="glass-strong rounded-3xl flex items-center justify-around px-2 py-3 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <NavLink href="/" icon={Home} label={t("home")} />
          <NavLink href="/leaderboard" icon={Trophy} label={t("leaderboard")} />
          <NavLink href="/results" icon={BarChart3} label={t("results")} />
          <NavLink href={user ? "/profile" : "/login"} icon={User} label={user ? t("profile") : tAuth("login")} />
        </div>
      </nav>
    </>
  );
}
