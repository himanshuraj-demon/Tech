"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";

interface SessionProviderProps {
  children: React.ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const basePath = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api/auth`
    : undefined;

  return (
    <NextAuthSessionProvider basePath={basePath}>
      {children}
    </NextAuthSessionProvider>
  );
}
