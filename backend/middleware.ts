import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345",
);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.pathname;

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin":
          process.env.FRONTEND_URL || "https://tech-henna-six.vercel.app",
        "Access-Control-Allow-Methods":
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Credentials": "true",
      },
    });
  }

  // Preserve malformed URL redirects
  const malformedClubMatch = url.match(/\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/);
  if (malformedClubMatch) {
    const cleanId = malformedClubMatch[1];
    const remainingPath = malformedClubMatch[3] || "";
    const cleanUrl = `/admin/clubs/${cleanId}${remainingPath}`;
    return NextResponse.redirect(new URL(cleanUrl, req.url));
  }

  const malformedApiMatch = url.match(
    /\/api\/admin\/clubs\/([^\/]+):(\d+)(\/.*)?/,
  );
  if (malformedApiMatch) {
    const cleanId = malformedApiMatch[1];
    const remainingPath = malformedApiMatch[3] || "";
    const cleanUrl = `/api/admin/clubs/${cleanId}${remainingPath}`;
    return NextResponse.redirect(new URL(cleanUrl, req.url));
  }

  // Admin authentication
  if (url.startsWith("/api/admin")) {
    const token = req.cookies.get("admin_session")?.value;

    if (!token) {
      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );

      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.FRONTEND_URL || "https://tech-henna-six.vercel.app",
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      const email = payload.email as string;
      const isAdmin =
        payload.isAdmin === true ||
        [
          "technical.secretary@iitgn.ac.in",
          "naveen.pal@iitgn.ac.in",
          "himanshu.raj@iitgn.ac.in",
          "vishal.boliwal@iitgn.ac.in",
        ].includes(email);

      if (!isAdmin) {
        const response = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );

        response.headers.set(
          "Access-Control-Allow-Origin",
          process.env.FRONTEND_URL || "https://tech-henna-six.vercel.app",
        );
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        );
        response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With",
        );
        response.headers.set("Access-Control-Allow-Credentials", "true");

        return response;
      }
    } catch (err) {
      console.error("Middleware JWT verification failed:", err);

      const response = NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );

      response.headers.set(
        "Access-Control-Allow-Origin",
        process.env.FRONTEND_URL || "https://tech-henna-six.vercel.app",
      );
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      );
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With",
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");

      return response;
    }
  }

  const response = NextResponse.next();

  response.headers.set(
    "Access-Control-Allow-Origin",
    process.env.FRONTEND_URL || "https://tech-henna-six.vercel.app",
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With",
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  return response;
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
