import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { getParisDate } from "@/lib/utils/weekend";

export async function GET(request: Request) {
  // 1. Auth Check (CRON_SECRET)
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createAdminClient();
  const now = new Date();
  const parisNow = getParisDate();
  
  const currentDay = parisNow.getDay(); // 0=Sun, 5=Fri
  const currentHour = parisNow.getHours(); 

  // LOGIC (Paris Time):
  // Friday 19:00 -> OPEN (Drop)
  // Sunday 12:00 -> LOCK (End of submission/staking)
  // Sunday 19:00 -> RESOLVE (Algorithm execution)

  const logs: string[] = [];

  // --- TRANSITION: UPCOMING -> OPEN ---
  if (currentDay === 5 && currentHour >= 19) {
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
    } else {
        logs.push("Upcoming check: No 'upcoming' theme found for Friday drop.");
    }
  }

  // --- TRANSITION: OPEN -> LOCKED ---
  if (currentDay === 0 && currentHour >= 12 && currentHour < 19) {
     const { data: openThemes } = await adminSupabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "open");
     
     if (openThemes && openThemes.length > 0) {
       for (const theme of openThemes) {
          const { error } = await adminSupabase
              .from("weekly_themes")
              .update({ 
                  status: "locked", 
                  locked_at: now.toISOString() 
              })
              .eq("id", theme.id);
          
          if (!error) logs.push(`Locked theme: ${theme.title}`);
          else logs.push(`Failed to lock theme: ${theme.title} - ${error.message}`);
       }
     }
  }

  // --- TRANSITION: LOCKED -> RESOLVING ---
  if (currentDay === 0 && currentHour >= 19) {
     const { data: lockedThemes } = await adminSupabase
        .from("weekly_themes")
        .select("*")
        .eq("status", "locked");

     if (lockedThemes && lockedThemes.length > 0) {
       for (const theme of lockedThemes) {
          const { error } = await adminSupabase
              .from("weekly_themes")
              .update({ 
                  status: "resolving", 
                  resolved_at: now.toISOString() 
              })
              .eq("id", theme.id);
          
          if (!error) logs.push(`Started resolving theme: ${theme.title}`);
          else logs.push(`Failed to resolve theme: ${theme.title} - ${error.message}`);
       }
     }
  }

  return NextResponse.json({ 
    success: true, 
    timestamp: now.toISOString(),
    logs 
  });
}
