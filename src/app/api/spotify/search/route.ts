import { createClient } from "@/lib/supabase/server";
import { searchTracks } from "@/lib/spotify/search";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic"; // No caching for search results

const SearchQuerySchema = z.object({
  q: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Check Authentication
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Query Params
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q) {
      return NextResponse.json({ tracks: [] });
    }

    // 3. Execute Search
    const tracks = await searchTracks(q);

    return NextResponse.json({ tracks });

  } catch (error) {
    console.error("[API] Spotify Search Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}
