"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { joinPodService } from "@/lib/game/pods";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function joinPod(themeId: string) {
  const supabase = await createClient();
  const adminSupabase = createAdminClient();
  
  /* console.log("JoinPod Action: Checking user session"); */
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/game/pod");
  }

  let result;
  try {
     // Use admin client to bypass RLS for Pod creation/joining logic
     result = await joinPodService(adminSupabase, user.id, themeId);
  } catch (error: any) {
     console.error("Join Pod Action Error:", error);
     throw new Error(`Failed to join pod: ${error.message}`);
  }

  revalidatePath("/game/pod");
  redirect(`/game/pod/${result.podId}`);
}
