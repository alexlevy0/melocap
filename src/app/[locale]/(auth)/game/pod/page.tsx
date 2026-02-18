
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { joinPod } from "@/app/actions/pods";
import { Button } from "@/components/ui/button";
import { Users, Info, Ticket } from "lucide-react";

export default async function PodHubPage() {
  const t = await getTranslations("pod");
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/game/pod");
  }

  // 1. Get current theme
  let { data: theme } = await supabase
    .from("weekly_themes")
    .select("*")
    .in("status", ["open", "locked", "resolving", "upcoming"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!theme) {
    // If no active theme
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
                 <Info className="w-8 h-8 text-slate-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">{t("waiting_status")}</h1>
            <p className="text-slate-400 max-w-md">
                {t("no_active_theme")}
            </p>
        </div>
    )
  }

  // 2. Check if user is in a pod
  const { data: membership } = await supabase
    .from("pods_members")
    .select(`
      pod_id,
      pods!inner (
        id,
        theme_id
      )
    `)
    .eq("user_id", user.id)
    .eq("pods.theme_id", theme.id)
    .single();

  if (membership) {
    // Already in a pod -> Redirect
    redirect(`/game/pod/${membership.pod_id}`);
  }

  // 3. User is NOT in a pod -> check status
  if (theme.status === 'upcoming') {
     return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-6">
            <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
                 <Ticket className="w-8 h-8 text-primary-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">{theme.title}</h1>
            <p className="text-slate-400 max-w-md">
                {t("upcoming_status")}
            </p>
             {/* Optional: Add a countdown or 'Notify Me' here */}
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-800 border border-white/5 text-sm text-slate-400">
                {t("status.opening_soon")}
            </div>
        </div>
     );
  }

  // 4. If Open -> Show Join UI
  const joinAction = joinPod.bind(null, theme.id);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-2xl mx-auto p-6 space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-500/10 text-primary-400 mb-4 border border-primary-500/20">
                <Ticket className="w-10 h-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
                {t("join_cta")}
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-800 border border-white/5 text-sm text-primary-300 font-medium">
                {theme.title}
            </div>
            <p className="text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">
                {t("join_description")}
            </p>
        </div>

        <form action={joinAction}>
            <Button size="lg" className="w-full md:w-auto text-lg px-12 py-6 h-auto shadow-xl shadow-primary-500/20 hover:shadow-primary-500/40 transition-all hover:scale-105 active:scale-95">
                <Users className="mr-3 w-5 h-5" />
                {t("join_cta")}
            </Button>
        </form>
    </div>
  );
}
