import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ registered: false, user: null });
    }

    const { id: hackathonId } = await params;

    const [registration] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, hackathonId),
          eq(eventRegistrations.userEmail, session.user.email)
        )
      )
      .limit(1);

    return NextResponse.json({
      registered: !!registration,
      registration: registration || null,
      user: session.user,
    });
  } catch (error) {
    console.error("Error checking hackathon registration status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
