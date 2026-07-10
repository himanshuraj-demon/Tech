import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { db, users } from "@/lib/db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345"
);

export async function POST(request: NextRequest) {
  const isDev =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === "true";

  if (!isDev) {
    return NextResponse.json(
      { error: "Developer credentials login is disabled in this environment." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || "dev-admin@iitgn.ac.in";
    const isAdmin = email.includes("admin") || 
                    ["technical.secretary@iitgn.ac.in", "naveen.pal@iitgn.ac.in", "himanshu.raj@iitgn.ac.in", "vishal.boliwal@iitgn.ac.in"].includes(email);
    const name = isAdmin ? "Developer Admin" : "Developer Student";
    const sub = isAdmin ? "dev-admin-id" : `dev-student-${email.replace(/[^a-zA-Z0-9]/g, '')}`;

    console.log(`🔑 Dev Bypass: Authenticating mock session for ${email} (isAdmin: ${isAdmin})...`);

    // Save or update the user details in our DB
    try {
      await db
        .insert(users)
        .values({
          id: sub,
          name: name,
          email: email,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: name,
            email: email,
            updatedAt: new Date(),
          },
        });
      console.log(`👤 Mock user profile saved/updated: ${email}`);
    } catch (dbErr) {
      console.error("Failed to save/update mock user in DB:", dbErr);
    }

    const payload = {
      sub,
      email,
      name,
      picture: null,
      isAdmin,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });
    const cookieName = isAdmin ? "admin_session" : "student_session";

    response.cookies.set(cookieName, token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Dev login error:", err);
    return NextResponse.json({ error: "Server error during developer login" }, { status: 500 });
  }}
