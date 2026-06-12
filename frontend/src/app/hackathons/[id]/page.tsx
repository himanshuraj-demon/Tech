import { Metadata } from "next";
import { HackathonDetailClient } from "@/components/hackathon-detail-client";

export const metadata: Metadata = {
  title: "Hackathon Details - Technical Council IITGN",
  description: "Explore details of hackathons organized by the Technical Council of IIT Gandhinagar.",
};

interface HackathonPageProps {
  params: Promise<{
    id: string;
  }>;
}

import { defaultHackathonsData } from "@/lib/hackathons-data";
import { api } from "../../../../services/api";

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await api.fetch(`${API_URL}/api/hackathons`);
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

export default async function HackathonPage({ params }: HackathonPageProps) {
  const resolvedParams = await params;
  return <HackathonDetailClient id={resolvedParams.id} />;
}
