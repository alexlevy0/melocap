import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { resolveWeeklyTheme } from "@/lib/game-engine/engine";

export const dynamic = "force-dynamic";

/**
 * Sunday 19:00 Paris Time Resolution CRON API
 * 
 * Verifies the CRON_SECRET and triggers the resolution engine.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = createAdminClient();
    
    // 1. Find the current theme to resolve
    // Theme should be in 'locked' status
    const { data: theme, error: themeError } = await supabase
      .from("weekly_themes")
      .select("id, title")
      .eq("status", "locked")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (themeError || !theme) {
      return NextResponse.json({ 
        message: "No 'locked' theme found to resolve.",
        details: themeError?.message
      });
    }

    // 2. Trigger resolution
    await resolveWeeklyTheme(theme.id);

    return NextResponse.json({ 
      message: "Resolution success", 
      themeResolved: theme.title 
    });
  } catch (error) {
    console.error("CRON Resolution Error:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Allow GET for testing in development with CRON_SECRET skip
export async function GET(req: NextRequest) {
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
    }
    return POST(req);
}
