import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getAdminEmails } from "./admin-emails-blob-storage";

// Get admin emails dynamically from storage
async function getAuthorizedEmails(): Promise<string[]> {
  try {
    const adminEmails = await getAdminEmails();
    return adminEmails.emails;
  } catch (error) {
    console.error("Error loading admin emails, using fallback:", error);
    // Fallback to hardcoded emails if storage fails
    return ["mukul.meena@iitgn.ac.in", "technical.secretary@iitgn.ac.in"];
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Developer Bypass",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "dev-admin@iitgn.ac.in",
        },
      },
      async authorize(credentials) {
        const isDev =
          process.env.NODE_ENV === "development" ||
          process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === "true";
        if (!isDev) {
          console.warn(
            "Attempted developer credentials bypass in a non-dev/non-allowed environment",
          );
          return null;
        }

        const email = credentials?.email || "dev-admin@iitgn.ac.in";
        console.log(
          `🔑 Dev Bypass: Authenticating mock admin session for ${email}...`,
        );

        return {
          id: "dev-admin-id",
          name: "Developer Admin",
          email: email,
          isAdmin: true,
        };
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) {
        return `${process.env.FRONTEND_URL || "http://localhost:3000"}${url}`;
      }
      // Allows callback URLs on the same origin as the frontend URL
      if (process.env.FRONTEND_URL) {
        try {
          const targetUrl = new URL(url);
          const allowedUrl = new URL(process.env.FRONTEND_URL);
          if (targetUrl.origin === allowedUrl.origin) {
            return url;
          }
        } catch (e) {
          console.error("Error parsing redirect URL:", e);
        }
      }
      return baseUrl;
    },
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const authorizedEmails = await getAuthorizedEmails();
        if (authorizedEmails.includes(user.email ?? "")) {
          user.isAdmin = true;
          return true;
        }
        return false;
      }
      if (account?.provider === "credentials") {
        const isDev =
          process.env.NODE_ENV === "development" ||
          process.env.NEXT_PUBLIC_ALLOW_DEV_LOGIN === "true";
        if (isDev) {
          user.isAdmin = true;
          return true;
        }
        return false;
      }
      return false;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.uid = user.id;
        token.isAdmin = user.isAdmin;
        token.email = user.email;
        token.name = user.name;
      }
      if (account?.provider === "google" && account.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.isAdmin = token.isAdmin;
        session.user.email = token.email;
        session.user.name = token.name;
      }
      if (typeof token.idToken === "string") {
        session.idToken = token.idToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  session: {
    strategy: "jwt",
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.callback-url"
          : "next-auth.callback-url",
      options: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.csrf-token"
          : "next-auth.csrf-token",
      options: {
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  secret:
    process.env.NEXTAUTH_SECRET ||
    "tech-web-iitgn-dev-fallback-secret-key-12345",
};

// Type augmentation for NextAuth
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      isAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    isAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid?: string;
    isAdmin?: boolean;
  }
}

// Extend NextAuth Session type to include idToken
declare module "next-auth" {
  interface Session {
    idToken?: string;
  }
}
