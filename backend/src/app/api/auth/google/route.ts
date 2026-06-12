import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3001";
  const redirectUri = `${BACKEND_URL}/api/auth/callback`;
  
  if (!GOOGLE_CLIENT_ID) {
    console.error("GOOGLE_CLIENT_ID environment variable is missing!");
    return NextResponse.json({ error: "OAuth configuration error" }, { status: 500 });
  }

  // Preserve the callbackUrl by passing it as the state parameter
  const searchParams = request.nextUrl.searchParams;
  const callbackUrl = searchParams.get("callbackUrl") || "";
  
  const scope = "openid email profile";
  const responseType = "code";
  const prompt = "select_account";
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + 
    `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}&` +
    `redirect_uri=${encodeURIComponent(redirectUri)}&` +
    `response_type=${responseType}&` +
    `scope=${encodeURIComponent(scope)}&` +
    `state=${encodeURIComponent(callbackUrl)}&` +
    `prompt=${prompt}`;
    
  return NextResponse.redirect(authUrl);
}
