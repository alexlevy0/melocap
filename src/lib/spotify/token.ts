import { z } from "zod";

const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

let cachedToken: string | null = null;
let tokenExpiration: number | null = null;

/**
 * Retrieves a valid Spotify Access Token using Client Credentials Flow.
 * Caches the token in memory to avoid hitting rate limits.
 */
export async function getSpotifyToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing SPOTIFY_CLIENT_ID or SPOTIFY_CLIENT_SECRET env vars");
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && tokenExpiration && Date.now() < tokenExpiration - 300000) {
    return cachedToken;
  }

  console.log("[Spotify] Fetching new Client Credentials token...");

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch Spotify token: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const parsed = TokenResponseSchema.parse(data);

  cachedToken = parsed.access_token;
  tokenExpiration = Date.now() + parsed.expires_in * 1000;

  return cachedToken;
}
