import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations, hackathons } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { v4 as uuidv4 } from "uuid";

const registerSchema = z.object({
  degreeType: z.enum(["btech", "mtech", "phd", "other"]),
  yearOfJoining: z.string().min(1),
  branchName: z.string().min(1),
  teamMembers: z.array(z.string()).optional().default([]),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const { id: hackathonId } = await params;
    
    // Check if the hackathon exists
    const [hackathon] = await db.select().from(hackathons).where(eq(hackathons.id, hackathonId)).limit(1);
    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    if (hackathon.status === "completed") {
      return NextResponse.json({ error: "Registrations are closed as this event has ended." }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // If team members required, check if they are provided
    if (hackathon.teamRequired && validatedData.teamMembers.length === 0) {
      return NextResponse.json({ error: "Team members are required for this hackathon" }, { status: 400 });
    }

    // Check if user already registered
    const [existingReg] = await db
      .select()
      .from(eventRegistrations)
      .where(
        and(
          eq(eventRegistrations.eventId, hackathonId),
          eq(eventRegistrations.userEmail, session.user.email)
        )
      )
      .limit(1);

    if (existingReg) {
      return NextResponse.json({ error: "You are already registered for this hackathon" }, { status: 400 });
    }

    const newReg = {
      id: uuidv4(),
      eventId: hackathonId, // keeping table column name eventId, but storing hackathonId
      userId: session.user.id || "unknown-sub",
      userName: session.user.name || "Anonymous",
      userEmail: session.user.email,
      degreeType: validatedData.degreeType,
      yearOfJoining: validatedData.yearOfJoining,
      branchName: validatedData.branchName,
      teamMembers: validatedData.teamMembers,
      winnerPlace: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const [created] = await db.insert(eventRegistrations).values(newReg).returning();

    return NextResponse.json({ success: true, registration: created }, { status: 201 });
  } catch (error) {
    console.error("Error in hackathon registration:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
