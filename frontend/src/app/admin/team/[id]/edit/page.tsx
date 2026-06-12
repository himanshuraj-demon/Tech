import EditTeamMemberPage from "./edit-page-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

import { defaultTeamData } from "@/lib/team-data";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/team`);
    if (res.ok) {
      const team = await res.json();
      if (Array.isArray(team) && team.length > 0) {
        return team.map((member: any) => ({ id: String(member.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch team from backend, using default static data", error);
  }

  return Object.keys(defaultTeamData).map((key) => ({
    id: key,
  }));
}

export default function Page({ params }: PageProps) {
  return <EditTeamMemberPage params={params} />;
}
