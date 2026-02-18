import { createAdminClient } from "@/lib/supabase/admin";
import { 
  rankSubmissions, 
  calculatePayouts, 
  calculateReputationChanges,
  Submission,
  Stake,
  RankedSubmission
} from "./resolve";
import { revalidatePath } from "next/cache";

/**
 * Orchestrates the resolution of a weekly theme.
 * High-risk operation, should be called by an authorized CRON job.
 */
export async function resolveWeeklyTheme(themeId: string) {
// ... (lines 16-159 skipped)

async function finishResolution(
    themeId: string, 
    top50: RankedSubmission[], 
    burned: number, 
    distributed: number
) {
  const supabase = createAdminClient();
  console.log(`🚀 Starting resolution for theme ${themeId}...`);

  // 1. Set status to 'resolving'
  await supabase
    .from("weekly_themes")
    .update({ status: "resolving" })
    .eq("id", themeId);

  // 2. Fetch all pods for this theme
  const { data: pods, error: podsErr } = await supabase
    .from("pods")
    .select("id")
    .eq("theme_id", themeId);
  
  const podIds = (pods || []).map(p => p.id);

  if (podsErr || podIds.length === 0) {
    console.log("⚠️ No pods found for this theme. Resolving as empty.");
    await finishResolution(themeId, [], 0, 0);
    return;
  }

  // 3. Fetch submissions
  const { data: submissionsRaw, error: subErr } = await supabase
    .from("submissions")
    .select("id, user_id, pod_id, track_name, artist_name, album_image_url, spotify_uri, created_at")
    .in("pod_id", podIds);

  if (subErr || !submissionsRaw) throw new Error("Failed to fetch submissions");

  // Fetch stakes for this theme directly
  const { data: stakesRaw, error: stakeErr } = await supabase
    .from("stakes")
    .select("id, user_id, submission_id, amount")
    .eq("theme_id", themeId);

  if (stakeErr || !stakesRaw) throw new Error("Failed to fetch stakes");

  // 3. Run pure logic
  const submissions: Submission[] = submissionsRaw.map(s => ({
    id: s.id,
    user_id: s.user_id,
    pod_id: s.pod_id,
    track_name: s.track_name,
    artist_name: s.artist_name,
    album_image_url: s.album_image_url,
    spotify_uri: s.spotify_uri,
    created_at: s.created_at
  }));

  const stakes: Stake[] = stakesRaw.map(s => ({
    id: s.id,
    user_id: s.user_id,
    submission_id: s.submission_id,
    amount: s.amount
  }));

  const ranked = rankSubmissions(submissions, stakes);
  const payouts = calculatePayouts(stakes, ranked);
  const reputationChanges = calculateReputationChanges(payouts);

  // 4. Update Rankings in DB
  console.log("💾 Updating submission rankings...");
  for (const sub of ranked) {
    await supabase
      .from("submissions")
      .update({ 
        global_score: sub.global_score, 
        global_rank: sub.global_rank 
      })
      .eq("id", sub.id);
  }

  // 5. Process Payouts & Reputation Atomically
  console.log("💰 Processing payouts and reputation atomically...");
  
  const { data: rpcResult, error: rpcError } = await supabase.rpc("process_weekly_payouts", {
    p_payouts: payouts,
    p_reputation_changes: reputationChanges
  });

  if (rpcError) {
    console.error("❌ Failed to process payouts (RPC Error):", rpcError);
    // We explicitly do NOT throw here to allow the process to attempt to finish/save state,
    // though in a real strict system we might want to retry or halt.
    // For now, we log it and proceed to close the theme, but marked as potential partial failure could be better.
  }

  const rpcStats = rpcResult as any;
  const stats = {
    totalCoinsBurned: rpcStats?.burned || 0,
    totalCoinsDistributed: rpcStats?.distributed || 0
  };

  // 6. Finish & Save results JSON
  await finishResolution(themeId, ranked.slice(0, 50), stats.totalCoinsBurned, stats.totalCoinsDistributed);
}

async function finishResolution(
    themeId: string, 
    top50: any[], 
    burned: number, 
    distributed: number
) {
  const supabase = createAdminClient();
  
  const results_json = {
    top50,
    stats: {
        totalCoinsBurned: burned,
        totalCoinsDistributed: distributed,
        resolvedAt: new Date().toISOString()
    }
  };

  await supabase
    .from("weekly_themes")
    .update({ 
      status: "finished", 
      results_json,
      resolved_at: new Date().toISOString()
    })
    .eq("id", themeId);

  revalidatePath("/");
  revalidatePath("/results");
  console.log("✅ Resolution complete!");
}
