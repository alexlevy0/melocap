
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/database";

// Reusable logic for joining a pod
// Designed to be called by both Server Actions and API Routes
export async function joinPodService(
  supabase: SupabaseClient<Database>, 
  userId: string, 
  themeId: string
): Promise<{ podId: string; status: "joined" | "created" | "already_in" }> {

    // 1. Check if user is already in a pod for this theme
    const { data: existingMembership } = await supabase
        .from("pods_members")
        .select(`
            pod_id,
            pods!inner (
                theme_id
            )
        `)
        .eq("user_id", userId)
        .eq("pods.theme_id", themeId)
        .single();
    
    if (existingMembership) {
        return { podId: (existingMembership as any).pod_id, status: "already_in" };
    }

    // 2. Try to find an available pod (not full)
    const { data: availablePod } = await supabase
        .from("pods")
        .select("id, member_count")
        .eq("theme_id", themeId)
        .eq("is_full", false)
        .lt("member_count", 7)
        .order("created_at", { ascending: true }) // Fill oldest pods first
        .limit(1)
        .single();

    let podId = availablePod?.id;

    if (podId) {
        // Attempt to join this pod
        const { error: joinError } = await supabase
            .from("pods_members")
            .insert({
                pod_id: podId,
                user_id: userId
            });

        if (!joinError) {
             // Success! Update member count
             // In production app, this should be atomic or via trigger
             await supabase
                .from("pods")
                .update({ 
                    member_count: (availablePod!.member_count || 0) + 1,
                    is_full: (availablePod!.member_count || 0) + 1 >= 7 
                })
                .eq("id", podId);
            
            return { podId, status: "joined" };
        } else {
             // If join failed (e.g. race condition), fallback to create new
             // or retry (omitted for MVP simplicity)
             podId = undefined; 
        }
    }

    // 3. Create new pod if no availability or join failed
    if (!podId) {
        const { data: newPod, error: createError } = await supabase
            .from("pods")
            .insert({
                theme_id: themeId,
                member_count: 1, 
                is_full: false
            })
            .select()
            .single();
        
        if (createError || !newPod) {
            throw new Error("Failed to create pod: " + createError?.message);
        }

        podId = newPod.id;

        // Add user to new pod
        const { error: insertError } = await supabase
            .from("pods_members")
            .insert({
                pod_id: podId,
                user_id: userId
            });
            
        if (insertError) {
             throw new Error("Failed to join created pod: " + insertError.message);
        }
        
        return { podId, status: "created" };
    }

    throw new Error("Unexpected error in joinPodService");
}
