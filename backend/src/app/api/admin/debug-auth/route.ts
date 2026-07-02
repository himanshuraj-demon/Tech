import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAdminEmails } from "@/lib/admin-emails-blob-storage";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Read admin emails from database
    let adminEmailsList: string[] = [];
    try {
      const adminData = await getAdminEmails();
      adminEmailsList = adminData.emails || [];
    } catch (error) {
      console.error('Error reading admin emails:', error);
    }

    const userEmail = session?.user?.email;
    const isAdmin = userEmail ? adminEmailsList.includes(userEmail) : false;

    return NextResponse.json({
      session: {
        exists: !!session,
        user: session?.user ? {
          name: session.user.name,
          email: session.user.email,
          image: session.user.image
        } : null
      },
      adminEmails: adminEmailsList,
      isAdmin,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error in debug-auth:", error);
    return NextResponse.json(
      { error: `Debug failed: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
