
import { createClient } from "@/lib/supabase/server";
import { joinPodService } from "@/lib/game/pods";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 1. Get active theme (Open)
  const { data: theme } = await supabase
      .from("weekly_themes")
      .select("id")
      .eq("status", "open")
      .limit(1)
      .single();

  if (!theme) {
      return NextResponse.json({ error: "No open theme at this moment." }, { status: 400 });
  }

  try {
      // 2. Call service logic
      const result = await joinPodService(supabase, user.id, theme.id);
      
      return NextResponse.json({ 
          success: true, 
          pod_id: result.podId,
          status: result.status 
      });

  } catch (error: any) {
      console.error("Join Pod API Error:", error);
      return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
