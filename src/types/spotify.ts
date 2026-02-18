import { z } from "zod";

// --- Zod Schemas ---

export const SpotifyImageSchema = z.object({
  url: z.string().url(),
  height: z.number().nullable(),
  width: z.number().nullable(),
});

export const SpotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  external_urls: z.object({
    spotify: z.string().url(),
  }),
});

export const SpotifyAlbumSchema = z.object({
  id: z.string(),
  name: z.string(),
  images: z.array(SpotifyImageSchema),
  release_date: z.string(),
  external_urls: z.object({
    spotify: z.string().url(),
  }),
});

export const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  artists: z.array(SpotifyArtistSchema),
  album: SpotifyAlbumSchema,
  duration_ms: z.number(),
  preview_url: z.string().nullable().optional(),
  external_urls: z.object({
    spotify: z.string().url(),
  }),
  popularity: z.number(),
});

export const SpotifySearchResponseSchema = z.object({
  tracks: z.object({
    href: z.string().url(),
    limit: z.number(),
    next: z.string().nullable(),
    offset: z.number(),
    previous: z.string().nullable(),
    total: z.number(),
    items: z.array(SpotifyTrackSchema),
  }),
});

// --- TypeScript Types (Inferred) ---

export type SpotifyImage = z.infer<typeof SpotifyImageSchema>;
export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;
export type SpotifyAlbum = z.infer<typeof SpotifyAlbumSchema>;
export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;
export type SpotifySearchResponse = z.infer<typeof SpotifySearchResponseSchema>;
