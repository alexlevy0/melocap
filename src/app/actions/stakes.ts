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

  // Use the atomic Postgres RPC to verify balance and save stakes
  const { data, error: rpcError } = await supabase.rpc("save_stakes", {
    p_pod_id: podId,
    p_stakes: stakes
      .filter((s) => s.amount > 0)
      .map((s) => ({
        submission_id: s.submissionId,
        amount: s.amount,
      })),
  });

  if (rpcError) {
    console.error("Failed to save stakes (RPC Error):", rpcError);
    throw new Error(rpcError.message || "Failed to save stakes");
  }

  revalidatePath(`/game/pod/${podId}`);
  return { success: true, data };
}
