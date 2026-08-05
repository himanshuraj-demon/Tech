import { NextRequest, NextResponse } from "next/server";
import { db, leaderboard } from "@/lib/db";
import { desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch pre-computed leaderboard data sorted by score descending
    const leaderboardData = await db
      .select()
      .from(leaderboard)
      .orderBy(desc(leaderboard.score));

    return NextResponse.json(leaderboardData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
