"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Get the current user's balance from their profile
 */
export async function getUserBalance() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return 0;

  const { data, error } = await supabase
    .from("users")
    .select("wallet_balance")
    .eq("id", user.id)
    .single();

  if (error || !data) return 0;
  return data.wallet_balance;
}

/**
 * Distributes +100 MeloCoins to ALL users.
 * To be called by a CRON job via API route.
 */
export async function distributeWeeklyCoins() {
  const adminSupabase = createAdminClient();
  
  // 1. Fetch all users
  const { data: users, error: fetchError } = await adminSupabase
    .from("users")
    .select("id, wallet_balance, display_name");

  if (fetchError || !users) {
    console.error("Failed to fetch users for allocation:", fetchError);
    throw new Error("Failed to fetch users");
  }

  const allocationAmount = 100;
  const results = {
    success: 0,
    failed: 0,
    total: users.length
  };

  // 2. Process using Atomic RPC (Batch Processing)
  const { data: rpcResult, error: rpcError } = await adminSupabase.rpc("distribute_weekly_coins", {
    p_amount: allocationAmount
  });

  if (rpcError) {
    console.error("Failed to distribute coins (RPC Error):", rpcError);
    throw new Error(rpcError.message || "Failed to distribute coins");
  }

  // Cast the result to the expected format since rpc returns any/Json
  const data = rpcResult as any;

  // Since it's all or nothing in the transaction unless we handle partials inside:
  // Our RPC returns { success: boolean, users_processed: number }
  const totalProcessed = data?.users_processed || 0;
  
  results.success = totalProcessed;
  results.failed = 0; // RPC is atomic, so if it succeeds, 0 failed. If it fails, it throws.
  results.total = users.length;

  revalidatePath("/");
  return results;
}
