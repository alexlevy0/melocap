
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// Reusable logic for joining a pod
// Designed to be called by both Server Actions and API Routes
// Uses Postgres RPC 'join_pod' for transaction atomicity (S2-06 Fix)
export async function joinPodService(
  supabase: SupabaseClient<Database>, 
  userId: string, 
  themeId: string
): Promise<{ podId: string; status: "joined" | "created" | "already_in" }> {
    const { data, error } = await supabase.rpc('join_pod', {
        p_user_id: userId,
        p_theme_id: themeId
    });

    if (error) {
        console.error("RPC join_pod error:", error);
        throw new Error("Failed to join pod: " + error.message);
    }

    // data is returned as a JSONB object from Postgres
    const result = data as { pod_id: string; status: string };
    
    if (!result || !result.pod_id) {
        throw new Error("Unexpected response structure from join_pod RPC");
    }

    return {
        podId: result.pod_id,
        status: result.status as "joined" | "created" | "already_in"
    };
}
