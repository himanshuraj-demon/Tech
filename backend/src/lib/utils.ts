import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Determines cookie configuration based on the request host.
 * Using SameSite=Lax and wildcard domain for IITGN subdomains ensures
 * that session cookies are shared across front/backend and not blocked.
 */
export function getCookieOptions(request: Request) {
  const hostHeader = request.headers.get("host");
  const isProd = process.env.NODE_ENV === "production";
  
  if (!hostHeader) {
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? ("none" as const) : ("lax" as const),
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    };
  }

  const hostname = hostHeader.split(":")[0].toLowerCase();

  // If localhost, don't set a domain
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    };
  }

  // Check if we are on council-iitgn.in or iitgn.ac.in subdomains
  const isIITGN = hostname.endsWith("council-iitgn.in") || hostname.endsWith("iitgn.ac.in");

  return {
    httpOnly: true,
    secure: true,
    sameSite: isIITGN ? ("lax" as const) : ("none" as const),
    domain: isIITGN ? (hostname.endsWith("council-iitgn.in") ? ".council-iitgn.in" : ".iitgn.ac.in") : undefined,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}

