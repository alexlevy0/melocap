import { getSpotifyToken } from "./token";
import { SpotifySearchResponseSchema, type SpotifyTrack } from "@/types/spotify";

/**
 * Search for tracks on Spotify.
 * @param query The search query string.
 * @param limit Number of results to return (default 10, max 50).
 * @returns Array of SpotifyTrack objects.
 */
export async function searchTracks(query: string, limit = 10): Promise<SpotifyTrack[]> {
  if (!query.trim()) return [];

  const token = await getSpotifyToken();
  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: limit.toString(),
    market: "FR", // Prioritize French market availability
  });

  const response = await fetch(`https://api.spotify.com/v1/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store", // Always fetch fresh results for search
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired? Retry logic could go here, but getSpotifyToken handles expiration based on time.
      // If 401 happens despite valid time, we might need to clear cache and retry.
      console.error("[Spotify] 401 Unauthorized during search");
      throw new Error("Spotify Unauthorized");
    }
    throw new Error(`Spotify API Error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Validate response with Zod
  const parsed = SpotifySearchResponseSchema.safeParse(data);

  if (!parsed.success) {
    console.error("[Spotify] Validation Error:", parsed.error);
    return [];
  }

  return parsed.data.tracks.items;
}
