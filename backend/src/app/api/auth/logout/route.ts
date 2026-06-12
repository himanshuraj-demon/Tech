import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const isProd = process.env.NODE_ENV === "production";
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    expires: new Date(0),
  });

  return response;
}
