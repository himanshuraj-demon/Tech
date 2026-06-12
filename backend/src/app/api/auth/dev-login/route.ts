import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

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

    console.log(`🔑 Dev Bypass: Authenticating mock admin session for ${email}...`);

    const payload = {
      sub: "dev-admin-id",
      email,
      name: "Developer Admin",
      picture: null,
      isAdmin: true,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.json({ success: true });

    response.cookies.set("admin_session", token, {
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
  }
}
