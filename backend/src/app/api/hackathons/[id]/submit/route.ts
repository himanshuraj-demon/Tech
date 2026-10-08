import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, eventRegistrations, hackathons } from "@/lib/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const submissionSchema = z.object({
  githubLink: z.string().trim().optional().nullable(),
  docsLink: z.string().trim().optional().nullable(),
  submissionData: z.record(z.any()).optional().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: hackathonId } = await params;
    const body = await request.json();
    const validatedData = submissionSchema.parse(body);

    const { githubLink, docsLink, submissionData } = validatedData;

    // 1. Verify the hackathon exists and is ongoing
    const [hackathon] = await db
      .select()
      .from(hackathons)
      .where(eq(hackathons.id, hackathonId))
      .limit(1);

    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    if (hackathon.deleted) {
      return NextResponse.json({ error: "Hackathon has been deleted" }, { status: 404 });
    }

    if (hackathon.status !== "ongoing" && hackathon.status !== "upcoming") {
      return NextResponse.json(
        { error: "Submissions are only allowed for upcoming or ongoing hackathons" },
        { status: 400 }
      );
    }

    // 2. Verify the user is registered for this hackathon
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

    if (!registration) {
      return NextResponse.json(
        { error: "You are not registered for this hackathon" },
        { status: 400 }
      );
    }

    // Compute final githubLink and docsLink with backward compatibility
    let finalGithubLink = githubLink;
    let finalDocsLink = docsLink;

    const mergedSubmissionData: Record<string, string> = {
      ...(registration.submissionData || {}),
      ...(submissionData || {}),
    };

    // If explicit githubLink or docsLink were not sent, try to infer from submissionData
    if (!finalGithubLink && mergedSubmissionData) {
      for (const [key, val] of Object.entries(mergedSubmissionData)) {
        if (typeof val === 'string' && (key.toLowerCase().includes('github') || val.includes('github.com'))) {
          finalGithubLink = val;
          break;
        }
      }
    }

    if (!finalDocsLink && mergedSubmissionData) {
      for (const [key, val] of Object.entries(mergedSubmissionData)) {
        if (typeof val === 'string' && (key.toLowerCase().includes('doc') || key.toLowerCase().includes('link') || val.includes('drive.google.com') || val.includes('notion.so'))) {
          finalDocsLink = val;
          break;
        }
      }
    }

    // 3. Update the registration record with submission data and links
    await db
      .update(eventRegistrations)
      .set({
        githubLink: finalGithubLink || null,
        docsLink: finalDocsLink || null,
        submissionData: mergedSubmissionData,
        updatedAt: new Date(),
      })
      .where(eq(eventRegistrations.id, registration.id));

    return NextResponse.json({
      success: true,
      message: "Project submitted successfully",
      githubLink: finalGithubLink,
      docsLink: finalDocsLink,
      submissionData: mergedSubmissionData,
    });
  } catch (error) {
    console.error("Error submitting project links:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
