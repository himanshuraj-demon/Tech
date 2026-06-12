import EditHackathonPage from "./edit-page-client";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

import { defaultHackathonsData } from "@/lib/hackathons-data";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/hackathons`);
    if (res.ok) {
      const hackathons = await res.json();
      if (Array.isArray(hackathons) && hackathons.length > 0) {
        return hackathons.map((hackathon: any) => ({ id: String(hackathon.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch hackathons from backend, using default static data", error);
  }

  return Object.keys(defaultHackathonsData).map((key) => ({
    id: key,
  }));
}

export default function Page({ params }: PageProps) {
  return <EditHackathonPage params={params} />;
}
