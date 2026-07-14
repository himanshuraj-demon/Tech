import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations, hackathons } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const winnersSchema = z.object({
  placements: z.array(z.object({
    regId: z.string(),
    rank: z.number(),
  })),
});

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
    const validatedData = winnersSchema.parse(body);

    // Reset all registrations for this hackathon to null winnerPlace
    await db
      .update(eventRegistrations)
      .set({ winnerPlace: null })
      .where(eq(eventRegistrations.eventId, hackathonId));

    // Update winner placements
    for (const p of validatedData.placements) {
      if (p.regId) {
        await db
          .update(eventRegistrations)
          .set({ winnerPlace: p.rank })
          .where(eq(eventRegistrations.id, p.regId));
      }
    }

    // Automatically transition status to completed
    await db
      .update(hackathons)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(hackathons.id, hackathonId));

    return NextResponse.json({ success: true, message: "Winners updated successfully" });
  } catch (error) {
    console.error("Error setting hackathon winners:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
