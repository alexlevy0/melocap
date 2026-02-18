import { NextRequest, NextResponse } from "next/server";
import { distributeWeeklyCoins } from "@/app/actions/economy";

/**
 * CRON Job: Distributes weekly coins to all users.
 * Triggered every Friday at 19:00 Paris time.
 */
export async function POST(req: NextRequest) {
  // Check for the secret header to authorize the CRON job
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await distributeWeeklyCoins();
    return NextResponse.json({ 
      message: "Weekly allocation completed", 
      ...results 
    });
  } catch (error) {
    console.error("CRON: Weekly allocation failed:", error);
    return NextResponse.json({ 
      error: "Internal Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

// Support GET for manual testing in browser (if in dev)
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
  }
  
  return POST(req);
}
