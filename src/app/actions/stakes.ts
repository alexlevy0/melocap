"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

interface StakeInput {
  submissionId: string;
  amount: number;
}

export async function saveStakes(podId: string, stakes: StakeInput[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  // 1. Verify theme status (must be 'open')
  const { data: pod, error: podError } = await supabase
    .from("pods")
    .select("theme:weekly_themes(status)")
    .eq("id", podId)
    .single();

  const themeStatus = Array.isArray(pod?.theme) ? pod?.theme[0]?.status : pod?.theme?.status;
  if (podError || themeStatus !== "open") {
    throw new Error("Staking is only allowed while the theme is open.");
  }

  // 2. Clear old stakes for this user in this pod's submissions
  // First get all submission IDs for this pod to target the delete
  const { data: submissions } = await supabase
    .from("submissions")
    .select("id")
    .eq("pod_id", podId);

  if (submissions && submissions.length > 0) {
    const subIds = submissions.map(s => s.id);
    await supabase
      .from("stakes")
      .delete()
      .eq("user_id", user.id)
      .in("submission_id", subIds);
  }

  // 3. Insert new stakes
  const { error: insertError } = await supabase
    .from("stakes")
    .insert(
      stakes
        .filter(s => s.amount > 0)
        .map(s => ({
          user_id: user.id,
          submission_id: s.submissionId,
          amount: s.amount
        }))
    );

  if (insertError) {
    console.error("Failed to save stakes:", insertError);
    throw new Error("Failed to save stakes");
  }

  revalidatePath(`/game/pod/${podId}`);
  return { success: true };
}
