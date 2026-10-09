import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations, hackathons } from "@/lib/db";
import { eq, and } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: hackathonId } = await params;
    const body = await request.json();
    const { items } = body;

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: "Invalid data: items array expected" }, { status: 400 });
    }

    let updatedCount = 0;

    for (const item of items) {
      if (!item.email) continue;

      const [existing] = await db
        .select()
        .from(eventRegistrations)
        .where(
          and(
            eq(eventRegistrations.eventId, hackathonId),
            eq(eventRegistrations.userEmail, item.email.trim().toLowerCase())
          )
        )
        .limit(1);

      if (existing) {
        const updatePayload: Record<string, any> = {
          updatedAt: new Date(),
        };

        if (item.submissionData && typeof item.submissionData === "object") {
          let existingData: Record<string, any> = {};
          if (typeof existing.submissionData === "string") {
            try {
              existingData = JSON.parse(existing.submissionData);
            } catch {}
          } else if (existing.submissionData && typeof existing.submissionData === "object") {
            existingData = existing.submissionData;
          }

          updatePayload.submissionData = {
            ...existingData,
            ...item.submissionData,
          };
        }

        if (item.githubLink) {
          updatePayload.githubLink = item.githubLink;
        }

        if (item.docsLink) {
          updatePayload.docsLink = item.docsLink;
        }

        if (item.winnerPlace !== undefined) {
          updatePayload.winnerPlace = item.winnerPlace;
        }

        await db
          .update(eventRegistrations)
          .set(updatePayload)
          .where(eq(eventRegistrations.id, existing.id));

        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${updatedCount} participant submissions from Excel/CSV import`,
      updatedCount,
    });
  } catch (error) {
    console.error("Error importing submissions from CSV:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
