import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345"
);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Preserve the emergency fix redirects for malformed URLs
  const malformedClubMatch = url.match(/\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/);
  if (malformedClubMatch) {
    const cleanId = malformedClubMatch[1];
    const remainingPath = malformedClubMatch[3] || '';
    const cleanUrl = `/admin/clubs/${cleanId}${remainingPath}`;
    console.log('MIDDLEWARE: Redirecting malformed URL from', url, 'to', cleanUrl);
    return NextResponse.redirect(new URL(cleanUrl, req.url));
  }

  const malformedApiMatch = url.match(/\/api\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/);
  if (malformedApiMatch) {
    const cleanId = malformedApiMatch[1];
    const remainingPath = malformedApiMatch[3] || '';
    const cleanUrl = `/api/admin/clubs/${cleanId}${remainingPath}`;
    console.log('MIDDLEWARE: Redirecting malformed API URL from', url, 'to', cleanUrl);
    return NextResponse.redirect(new URL(cleanUrl, req.url));
  }

  // Only run auth verification for backend admin API routes
  if (url.startsWith("/api/admin")) {
    const token = req.cookies.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      
      const email = payload.email as string;
      const isAdmin = payload.isAdmin === true || (email && (
        email.endsWith('@iitgn.ac.in') || 
        email === 'mukulmee771@gmail.com'
      ));

      if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Session is valid, proceed
      return NextResponse.next();
    } catch (err) {
      console.error("Middleware JWT verification failed:", err);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/admin/:path*', '/admin/:path*'],
};
