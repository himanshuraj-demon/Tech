import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345"
);

export async function GET(request: NextRequest) {
  const adminToken = request.cookies.get("admin_session")?.value;
  const studentToken = request.cookies.get("student_session")?.value;
  const token = adminToken || studentToken;

  if (!token) {
    return NextResponse.json({ user: null });
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return NextResponse.json({
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        isAdmin: payload.isAdmin || false,
      },
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}
