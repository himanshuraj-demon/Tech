"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "./auth-guard";

export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return isLoginPage ? <>{children}</> : <AuthGuard>{children}</AuthGuard>;
}
