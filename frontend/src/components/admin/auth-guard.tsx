"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export function AuthGuard({ children, requireAdmin = true }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/admin/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-400 font-medium">Checking authorization...</p>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && requireAdmin && !session?.user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-500 font-space-grotesk">Unauthorized</h1>
          <p className="text-gray-400">You do not have administrator privileges to view this page.</p>
          <button
            onClick={() => router.push("/admin/login")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return null;
}
