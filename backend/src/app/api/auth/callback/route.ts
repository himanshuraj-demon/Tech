import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { getAdminEmails } from "@/lib/admin-emails-blob-storage";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345"
);
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function getAuthorizedEmails(): Promise<string[]> {
  try {
    const adminEmails = await getAdminEmails();
    return adminEmails.emails;
  } catch (error) {
    console.error("Error loading admin emails, using fallback:", error);
    return ["naveen.pal@iitgn.ac.in", "technical.secretary@iitgn.ac.in"];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // callbackUrl is stored in state
  const error = searchParams.get("error");

  const fallbackRedirect = `${FRONTEND_URL}/admin`;
  const redirectPath = state ? decodeURIComponent(state) : fallbackRedirect;

  if (error || !code) {
    console.error("Google OAuth callback error:", error);
    return NextResponse.redirect(`${FRONTEND_URL}/admin/login?error=GoogleAuthFailed`);
  }

  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
  const redirectUri = `${BACKEND_URL}/api/auth/callback`;

  try {
    // Exchange authorization code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errData = await tokenResponse.json();
      console.error("Token exchange failed:", errData);
      return NextResponse.redirect(`${FRONTEND_URL}/admin/login?error=TokenExchangeFailed`);
    }

    const tokens = await tokenResponse.json();
    const accessToken = tokens.access_token;

    // Fetch user info
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error("Failed to fetch user info");
      return NextResponse.redirect(`${FRONTEND_URL}/admin/login?error=FetchUserInfoFailed`);
    }

    const userData = await userResponse.json();
    const email = userData.email;

    // Verify admin access
    const authorizedEmails = await getAuthorizedEmails();
    const isAllowed = authorizedEmails.includes(email ?? "") || (email && (email === "technical.secretary@iitgn.ac.in") || email==="naveen.pal@iitgn.ac.in" ||email==="himanshu.raj@iitgn.ac.in");

    if (!isAllowed) {
      console.warn(`Unauthorized login attempt by email: ${email}`);
      return NextResponse.redirect(`${FRONTEND_URL}/admin/login?error=Unauthorized`);
    }

    // Sign session JWT
    const payload = {
      sub: userData.sub,
      email,
      name: userData.name,
      picture: userData.picture,
      isAdmin: true,
    };

    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const isProd = process.env.NODE_ENV === "production";
    const response = NextResponse.redirect(redirectPath);

    response.cookies.set("admin_session", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err) {
    console.error("Error in OAuth callback handler:", err);
    return NextResponse.redirect(`${FRONTEND_URL}/admin/login?error=ServerError`);
  }
}
