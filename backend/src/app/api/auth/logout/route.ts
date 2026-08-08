import { NextRequest, NextResponse } from "next/server";
import { getCookieOptions } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  const cookieOptions = getCookieOptions(request);

  response.cookies.set("admin_session", "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });

  response.cookies.set("student_session", "", {
    ...cookieOptions,
    expires: new Date(0),
    maxAge: 0,
  });

  return response;
}
