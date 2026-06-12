import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "tech-web-iitgn-dev-fallback-secret-key-12345"
);

export async function getServerSession(options?: any): Promise<any> {
  try {
    const cookieStore = cookies();
    let token: string | undefined;

    // Next.js 15+ cookies() returns a Promise, handle both sync and async
    if (cookieStore instanceof Promise) {
      const resolvedStore = await cookieStore;
      token = resolvedStore.get("admin_session")?.value;
    } else {
      token = (cookieStore as any).get("admin_session")?.value;
    }

    if (!token) {
      return null;
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    return {
      user: {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture,
        isAdmin: payload.isAdmin,
      },
    };
  } catch (error) {
    console.error("Session verification in next-auth shim failed:", error);
    return null;
  }
}

// NextAuth compatibility exports
export type NextAuthOptions = any;
export type Session = any;
export type User = any;
