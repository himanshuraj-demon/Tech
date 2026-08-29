import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, events } from "@/lib/db";
import { revalidatePath } from "next/cache";

async function checkAdminAuth() {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin || false;
}

export async function POST() {
  try {
    const isAdmin = await checkAdminAuth();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updated = await db
      .update(events)
      .set({
        draft: false,
        updatedAt: new Date(),
      })
      .returning();

    revalidatePath("/admin/events");
    revalidatePath("/achievements");

    return NextResponse.json({
      success: true,
      count: updated.length,
      message: `Successfully published ${updated.length} events to the public website.`,
    });
  } catch (error) {
    console.error("Error publishing all events:", error);
    return NextResponse.json(
      { error: "Failed to publish all events" },
      { status: 500 }
    );
  }
}
