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
  const supabase = createClient();
  const { data: { user } } = await (await supabase).auth.getUser();

  if (!user) {
    throw new Error(t("unauthorized"));
  }

  // 1. Verify user is member of the pod
  const { data: membership } = await (await supabase)
    .from("pods_members")
    .select("pod_id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .single();

  if (!membership) {
    throw new Error(t("unauthorized"));
  }

  // 1.5 Check Theme Status (must be 'open')
  const { data: pod } = await (await supabase)
    .from("pods")
    .select(`
      theme_id,
      weekly_themes!inner (
        status
      )
    `)
    .eq("id", podId)
    .single();

  if (!pod || (pod.weekly_themes as any)?.status !== "open") {
    throw new Error(t("weekendOnly")); // Or specific error "Theme is not open for submissions"
  }

  // 2. Check if user already submitted for this pod
  const { data: existingSubmission } = await (await supabase)
    .from("submissions")
    .select("id")
    .eq("pod_id", podId)
    .eq("user_id", user.id)
    .maybeSingle(); // Use maybeSingle to avoid error if none found

  if (existingSubmission) {
    throw new Error(t("alreadyInPod")); // Reusing existing error key or add new one
  }

  // 3. Check if track is already taken in this pod
  const { data: duplicateTrack } = await (await supabase)
    .from("submissions")
    .select("id")
    .eq("pod_id", podId)
    .eq("spotify_track_id", track.spotify_track_id)
    .maybeSingle();

  if (duplicateTrack) {
    throw new Error(t("trackAlreadyTaken"));
  }

  // 4. Insert submission
  const { error } = await (await supabase)
    .from("submissions")
    .insert({
      pod_id: podId,
      user_id: user.id,
      spotify_track_id: track.spotify_track_id,
      track_name: track.track_name,
      artist_name: track.artist_name,
      album_image_url: track.album_image_url,
      preview_url: track.preview_url,
      spotify_uri: track.spotify_uri,
      // theme_id is implicit via pod, but we check theme status via RLS or trigger usually.
      // For MVP, we trust the UI state or add a check here.
    } as any); // Temporary cast to bypass TS missing types if not fully generated

  if (error) {
    console.error("Submit Track Error:", error);
    throw new Error(t("generic") + ": " + error.message);
  }

  revalidatePath(`/game/pod/${podId}`);
  return { success: true };
}
