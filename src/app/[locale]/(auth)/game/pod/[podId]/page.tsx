
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { SubmitTrackDialog } from "@/components/game/SubmitTrackDialog";
import { PodMembers } from "@/components/game/PodMembers";

interface PodPageProps {
    params: {
        locale: string;
        podId: string;
    }
}

export default async function PodPage({ params }: PodPageProps) {
  // Await the params object (Next.js 15 requirement)
  const { podId } = await params;
  
  const t = await getTranslations("pod");
  
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    redirect(`/login?next=/game/pod/${podId}`);
  }

  // 1. Get Pod Details
  const { data: pod, error } = await (await supabase)
    .from("pods")
    .select(`
        id,
        member_count,
        is_full,
        theme:weekly_themes (
            id,
            title,
            status
        )
    `)
    .eq("id", podId)
    .single();

  if (error || !pod) {
      redirect("/game/pod"); // Fallback to join page if pod not found
  }

  // 2. Security Check: Is user member of this pod?
  const { data: membership } = await (await supabase)
    .from("pods_members")
    .select("id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
      // User trying to access a pod they are not in
      // Redirect to their actual pod or join page
      redirect("/game/pod");
  }

  // 3. Fetch members
  const { data: members } = await (await supabase)
    .from("pods_members")
    .select(`
        user_id,
        joined_at,
        user:users (
            display_name,
            avatar_url
        )
    `)
    .eq("pod_id", (pod as any).id)
    .order("joined_at", { ascending: true });
  
  // Cast members manually for now (or improve types later)
  const safeMembers = (members || []) as any[];
  
  // 4. Check if user has already submitted a track
  const { data: userSubmission } = await (await supabase)
    .from("submissions")
    .select("*")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single();

  // 5. Get all submissions for this pod to display in slots
  const { data: allSubmissions } = await (await supabase)
      .from("submissions")
      .select("*")
      .eq("pod_id", podId);

  // Destructure theme for easier access in JSX
  const theme = (pod as any).theme as { id: string; title: string; status: string };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between gap-4">
             <div>
                <h1 className="text-3xl font-display font-bold text-white mb-1">
                    {t("title")}
                </h1>
                <div className="flex items-center gap-2 text-primary-400">
                    <span className="bg-primary-500/10 px-3 py-1 rounded-full text-sm font-medium border border-primary-500/20">
                         {t("theme", { theme: theme.title })}
                    </span>
                    <span className="text-slate-500 text-sm">
                        • {t(`status.${theme.status}`)}
                    </span>
                </div>
             </div>

             {/* Action Area */}
             <div className="flex items-center gap-4">
                 {theme.status === 'open' && !userSubmission && (
                     <SubmitTrackDialog podId={podId} />
                 )}
                 {userSubmission && (
                      <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm font-medium flex items-center gap-2">
                          ✓ {t("slots.submitted")}
                      </div>
                 )}
             </div>
        </div>

        {/* Pod Grid */}
        <div className="w-full max-w-5xl">
            <PodMembers members={safeMembers || []} submissions={allSubmissions || []} />
        </div>

        {/* Debug Info (Temporary) */}
        {/* <pre className="text-xs text-slate-800 mt-10">
            {JSON.stringify({ podId, members }, null, 2)}
        </pre> */}
    </div>
  );
}
