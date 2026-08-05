import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations, leaderboard } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset leaderboard by deleting all registrations and leaderboard pre-computations
    await db.transaction(async (tx) => {
      await tx.delete(eventRegistrations);
      await tx.delete(leaderboard);
    });

    return NextResponse.json({
      success: true,
      message: "Leaderboard points and registrations have been reset successfully.",
    });
  } catch (error) {
    console.error("Error resetting leaderboard:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
