"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  isAdmin?: boolean;
}

interface Session {
  user?: User;
  idToken?: string;
}

interface SessionContextType {
  data: Session | null;
  status: "loading" | "authenticated" | "unauthenticated";
  update: () => Promise<Session | null | undefined>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode; [key: string]: any }) {
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");

  const fetchSession = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
      const res = await fetch(`${apiUrl}/api/auth/session`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          setSession(data);
          setStatus("authenticated");
          return data;
        }
      }
      setSession(null);
      setStatus("unauthenticated");
      return null;
    } catch (error) {
      console.error("Failed to fetch session in shim:", error);
      setSession(null);
      setStatus("unauthenticated");
      return null;
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <SessionContext.Provider value={{ data: session, status, update: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}

export async function signIn(provider?: string, options?: { callbackUrl?: string; [key: string]: any }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  if (provider === "credentials") {
    const email = prompt("Enter email for developer bypass login:", "dev-admin@iitgn.ac.in");
    if (!email) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/auth/dev-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include",
      });
      if (res.ok) {
        window.location.href = options?.callbackUrl || "/admin";
      } else {
        alert("Developer bypass login failed");
      }
    } catch (e) {
      console.error(e);
      alert("Developer bypass login encountered an error");
    }
    return;
  }

  // Redirect to backend Google OAuth page
  const callbackUrl = options?.callbackUrl ? encodeURIComponent(options.callbackUrl) : "";
  window.location.href = `${apiUrl}/api/auth/google?callbackUrl=${callbackUrl}`;
}

export async function signOut(options?: { callbackUrl?: string; [key: string]: any }) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  try {
    await fetch(`${apiUrl}/api/auth/logout`, { credentials: "include" });
  } catch (e) {
    console.error("SignOut request failed:", e);
  }
  window.location.href = options?.callbackUrl || "/admin/login";
}
