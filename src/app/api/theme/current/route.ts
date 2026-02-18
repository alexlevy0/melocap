
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  
  // Logic: 
  // 1. Try to find an Open, Locked, or Resolving theme (Active)
  // 2. If none, find the next Upcoming theme

  let { data: theme, error } = await supabase
    .from("weekly_themes")
    .select("*")
    .in("status", ["open", "locked", "resolving"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!theme) {
     // No active theme, look for upcoming
     const { data: upcoming } = await supabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "upcoming")
        .order("week_number", { ascending: true }) // Get the nearest one
        .limit(1)
        .single();
     
     theme = upcoming;
  }

  if (!theme) {
    return NextResponse.json({ message: "No active or upcoming theme found" }, { status: 404 });
  }

  return NextResponse.json({ theme });
}
