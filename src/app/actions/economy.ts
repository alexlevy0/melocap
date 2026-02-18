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

  // 2. Process each user (for small scale, loop is okay. For thousands, use RPC/Bulk)
  for (const user of users) {
    try {
      const newBalance = (user.wallet_balance || 0) + allocationAmount;

      // Update user balance
      const { error: updateError } = await adminSupabase
        .from("users")
        .update({ wallet_balance: newBalance })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Log transaction
      const { error: transError } = await adminSupabase
        .from("transactions")
        .insert({
          user_id: user.id,
          type: "weekly_allocation",
          amount: allocationAmount,
          balance_after: newBalance,
          description: `Weekly allocation Support Drop`
        });

      if (transError) throw transError;

      results.success++;
    } catch (err) {
      console.error(`Failed to distribute coins to ${user.id}:`, err);
      results.failed++;
    }
  }

  revalidatePath("/");
  return results;
}
