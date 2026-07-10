import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

const winnersSchema = z.object({
  firstPlaceRegId: z.string().nullable().optional(),
  secondPlaceRegId: z.string().nullable().optional(),
  thirdPlaceRegId: z.string().nullable().optional(),
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

    const { firstPlaceRegId, secondPlaceRegId, thirdPlaceRegId } = validatedData;

    // Reset all registrations for this hackathon to null winnerPlace
    await db
      .update(eventRegistrations)
      .set({ winnerPlace: null })
      .where(eq(eventRegistrations.eventId, hackathonId));

    // Update 1st place winner
    if (firstPlaceRegId) {
      await db
        .update(eventRegistrations)
        .set({ winnerPlace: 1 })
        .where(eq(eventRegistrations.id, firstPlaceRegId));
    }

    // Update 2nd place winner
    if (secondPlaceRegId) {
      await db
        .update(eventRegistrations)
        .set({ winnerPlace: 2 })
        .where(eq(eventRegistrations.id, secondPlaceRegId));
    }

    // Update 3rd place winner
    if (thirdPlaceRegId) {
      await db
        .update(eventRegistrations)
        .set({ winnerPlace: 3 })
        .where(eq(eventRegistrations.id, thirdPlaceRegId));
    }

    return NextResponse.json({ success: true, message: "Winners updated successfully" });
  } catch (error) {
    console.error("Error setting hackathon winners:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
