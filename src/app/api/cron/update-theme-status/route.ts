
import { createAdminClient } from "@/lib/supabase/admin";
import { ThemeStatus } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // 1. Auth Check (CRON_SECRET)
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const now = new Date(); // UTC by default in Edge environment
  
  // NOTE: Logic assumes Paris time (CET/CEST). 
  // Simple approximation: UTC+1 (Winter) or UTC+2 (Summer). 
  // For MVP, we'll use UTC times that correspond roughly to Paris 19:00.
  // 19:00 Paris = 18:00 UTC (Winter) / 17:00 UTC (Summer).
  
  const currentDay = now.getUTCDay(); // 0=Sun, 5=Fri
  const currentHour = now.getUTCHours(); 

  // LOGIC:
  // Friday 17:00 UTC (approx 18-19h Paris) -> OPEN upcoming theme
  // Sunday 11:00 UTC (approx 12-13h Paris) -> LOCK open theme
  // Sunday 17:00 UTC (approx 18-19h Paris) -> RESOLVE locked theme

  const logs: string[] = [];

  // --- TRANSITION: UPCOMING -> OPEN ---
  if (currentDay === 5 && currentHour >= 17) {
    // Find upcoming theme for this week
    // Doing a loose check for now: just pick the first upcoming one
    const { data: upcoming } = await adminSupabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "upcoming")
        .order("week_number", { ascending: true })
        .limit(1)
        .single();

    if (upcoming) {
        const { error } = await adminSupabase
            .from("weekly_themes")
            .update({ 
                status: "open", 
                opened_at: now.toISOString() 
            })
            .eq("id", upcoming.id);
        
        if (!error) logs.push(`Opened theme: ${upcoming.title}`);
        else logs.push(`Failed to open theme: ${upcoming.title} - ${error.message}`);
    }
  }

  // --- TRANSITION: OPEN -> LOCKED ---
  if (currentDay === 0 && currentHour >= 11 && currentHour < 17) {
     const { data: openThemes } = await adminSupabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "open");
     
     for (const theme of openThemes || []) {
        const { error } = await adminSupabase
            .from("weekly_themes")
            .update({ 
                status: "locked", 
                locked_at: now.toISOString() 
            })
            .eq("id", theme.id);
        
        if (!error) logs.push(`Locked theme: ${theme.title}`);
     }
  }

  // --- TRANSITION: LOCKED -> RESOLVING ---
  if (currentDay === 0 && currentHour >= 17) {
     const { data: lockedThemes } = await adminSupabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "locked");

     for (const theme of lockedThemes || []) {
        const { error } = await adminSupabase
            .from("weekly_themes")
            .update({ 
                status: "resolving", 
                resolved_at: now.toISOString() 
            })
            .eq("id", theme.id);
        
        if (!error) logs.push(`Started resolving theme: ${theme.title}`);
     }
  }

  return NextResponse.json({ 
    success: true, 
    timestamp: now.toISOString(),
    logs 
  });
}
