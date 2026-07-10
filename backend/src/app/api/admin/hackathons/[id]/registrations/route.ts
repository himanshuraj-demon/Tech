import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations } from "@/lib/db";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: hackathonId } = await params;

    const registrations = await db
      .select()
      .from(eventRegistrations)
      .where(eq(eventRegistrations.eventId, hackathonId));

    return NextResponse.json(registrations);
  } catch (error) {
    console.error("Error fetching hackathon registrations:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
