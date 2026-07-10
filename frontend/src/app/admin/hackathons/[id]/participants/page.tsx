import ParticipantsClient from "./participants-client";
import { defaultHackathonsData } from "@/lib/hackathons-data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/hackathons`);
    if (res.ok) {
      const data = await res.json();
      const hackathons = data.hackathons || [];
      if (Array.isArray(hackathons) && hackathons.length > 0) {
        return hackathons.map((h: any) => ({ id: String(h.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch hackathons from backend, using default static data", error);
  }

  return Object.keys(defaultHackathonsData).map((key) => ({
    id: key,
  }));
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ParticipantsClient hackathonId={resolvedParams.id} />;
}
