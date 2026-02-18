
import { createClient } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { SubmitTrackDialog } from "@/components/game/SubmitTrackDialog";
import { PodMembers } from "@/components/game/PodMembers";
import { StakingZone } from "@/components/game/StakingZone";

interface PodPageProps {
    params: Promise<{
        locale: string;
        podId: string;
    }>
}

export default async function PodPage({ params }: PodPageProps) {
  const { podId } = await params;
  const t = await getTranslations("pod");
  
  const supabase = await createClient(); // Await once
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/game/pod/${podId}`);
  }

  // 1. Get Pod Details
  const { data: pod, error } = await supabase
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
      redirect("/game/pod");
  }

  // 2. Security Check
  const { data: membership } = await supabase
    .from("pods_members")
    .select("id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
      redirect("/game/pod");
  }

  // 3. Fetch members
  const { data: members } = await supabase
    .from("pods_members")
    .select(`
        user_id,
        joined_at,
        user:users (
            display_name,
            avatar_url
        )
    `)
    .eq("pod_id", pod.id)
    .order("joined_at", { ascending: true });
  
  const safeMembers = (members || []).map(m => ({
    user_id: m.user_id,
    joined_at: m.joined_at,
    user: Array.isArray(m.user) ? m.user[0] : m.user
  }));
  
  // 4. Check user submission
  const { data: userSubmission } = await supabase
    .from("submissions")
    .select("*")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .maybeSingle();

  // 5. Get all submissions
  const { data: allSubmissions } = await supabase
      .from("submissions")
      .select("*")
      .eq("pod_id", podId);

  // 6. Get user wallet balance
  const { data: userData } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  // 7. Get user's existing stakes in this pod
  const submissionIds = (allSubmissions || []).map(s => s.id);
  const { data: userStakes } = await supabase
    .from("stakes")
    .select("*")
    .eq("user_id", user.id)
    .in("submission_id", submissionIds);

  // Type-safe join handling
  const theme = Array.isArray(pod.theme) ? pod.theme[0] : pod.theme;

  if (!theme) {
      redirect("/game/pod");
  }

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
                 {theme.status === 'open' && (
                     <SubmitTrackDialog 
                        podId={podId} 
                        initialTrack={userSubmission ? {
                            id: userSubmission.spotify_track_id,
                            name: userSubmission.track_name,
                            artists: [{ id: 'mock', name: userSubmission.artist_name, external_urls: { spotify: '' } }],
                            album: { 
                                id: 'mock', 
                                name: 'Unknown Album', 
                                images: userSubmission.album_image_url ? [{ url: userSubmission.album_image_url, height: 640, width: 640 }] : [], 
                                release_date: '', 
                                external_urls: { spotify: '' } 
                            },
                            duration_ms: 0,
                            preview_url: userSubmission.preview_url,
                            external_urls: { spotify: userSubmission.spotify_uri || "" },
                            popularity: 0
                        } : undefined}
                     />
                 )}
             </div>
        </div>

        <div className="w-full max-w-5xl">
            <PodMembers members={safeMembers || []} submissions={allSubmissions || []} />
        </div>

        {/* Staking Area */}
        {theme.status === 'open' && userSubmission && (
             <div className="w-full max-w-5xl animate-in slide-in-from-bottom duration-700">
                <StakingZone 
                    podId={podId}
                    submissions={allSubmissions || []}
                    initialStakes={userStakes || []}
                    walletBalance={userData?.wallet_balance || 0}
                />
             </div>
        )}

        {/* Debug Info (Temporary) */}
        {/* <pre className="text-xs text-slate-800 mt-10">
            {JSON.stringify({ podId, members }, null, 2)}
        </pre> */}
    </div>
  );
}
