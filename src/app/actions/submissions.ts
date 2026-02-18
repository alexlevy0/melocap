"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

export interface SpotifyTrackSubmission {
  spotify_track_id: string;
  track_name: string;
  artist_name: string;
  album_image_url: string | null;
  preview_url: string | null;
  spotify_uri: string;
}

export async function submitTrack(podId: string, track: SpotifyTrackSubmission) {
  const t = await getTranslations("errors");
  const supabase = await createClient(); // Await once here
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error(t("unauthorized"));
  }

  // 1. Verify user is member of the pod
  const { data: membership } = await supabase
    .from("pods_members")
    .select("pod_id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    throw new Error(t("unauthorized"));
  }

  // 1.5 Check Theme Status (must be 'open')
  const { data: pod } = await supabase
    .from("pods")
    .select(`
      theme_id,
      weekly_themes!inner (
        status
      )
    `)
    .eq("id", podId)
    .single();

  if (!pod) {
    throw new Error(t("generic"));
  }

  // Type-safe status check
  const themeStatus = Array.isArray(pod.weekly_themes) 
    ? pod.weekly_themes[0]?.status 
    : pod.weekly_themes?.status;

  if (themeStatus !== "open") {
    throw new Error(t("weekendOnly"));
  }

  // 2. Check if user already submitted for this pod
  const { data: existingSubmission } = await supabase
    .from("submissions")
    .select("id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Check if track is already taken in this pod (excluding current user's submission if any)
  let duplicateQuery = supabase
    .from("submissions")
    .select("id, user_id")
    .eq("pod_id", podId)
    .eq("spotify_track_id", track.spotify_track_id);

  if (existingSubmission) {
    duplicateQuery = duplicateQuery.neq("user_id", user.id);
  }

  const { data: duplicateTrack } = await duplicateQuery.maybeSingle();

  if (duplicateTrack) {
    throw new Error(t("trackAlreadyTaken"));
  }

  // 4. Upsert submission
  const { error } = await supabase
    .from("submissions")
    .upsert({
      id: existingSubmission?.id, // If exists, update this ID
      pod_id: podId,
      user_id: user.id,
      spotify_track_id: track.spotify_track_id,
      track_name: track.track_name,
      artist_name: track.artist_name,
      album_image_url: track.album_image_url,
      preview_url: track.preview_url,
      spotify_uri: track.spotify_uri,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Submit Track Error:", error);
    throw new Error(t("generic") + ": " + error.message);
  }

  revalidatePath(`/game/pod/${podId}`);
  return { success: true };
}
