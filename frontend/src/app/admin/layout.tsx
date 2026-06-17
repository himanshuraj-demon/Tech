import type { Metadata } from "next";
import { AdminLayoutWrapper } from "@/components/admin/admin-layout-wrapper";

export const metadata: Metadata = {
  title: "Admin Dashboard - Technical Council IITGN",
  description: "Admin dashboard for managing Technical Council website content",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
    </div>
  );
}