import { Metadata } from "next";
import { HackathonDetailClient } from "@/components/hackathon-detail-client";
import { defaultHackathonsData } from "@/lib/hackathons-data";

export const metadata: Metadata = {
  title: "Hackathon Details - Technical Council IITGN",
  description: "Explore details of hackathons organized by the Technical Council of IIT Gandhinagar.",
};

interface HackathonPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/events`); // Using standard API fetch or fallback
    if (res.ok) {
      const data = await res.json();
      // If we fetch all hackathons
      const hackathonsRes = await fetch(`${API_URL}/api/hackathons`);
      if (hackathonsRes.ok) {
        const hData = await hackathonsRes.json();
        const hackathons = hData.hackathons || [];
        if (Array.isArray(hackathons) && hackathons.length > 0) {
          return hackathons.map((h: any) => ({ id: String(h.id) }));
        }
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
