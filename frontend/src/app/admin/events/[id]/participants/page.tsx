import ParticipantsClient from "./participants-client";
import { defaultEventsData } from "@/lib/events-data";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    const res = await fetch(`${API_URL}/api/events`);
    if (res.ok) {
      const events = await res.json();
      if (Array.isArray(events) && events.length > 0) {
        return events.map((event: any) => ({ id: String(event.id) }));
      }
    }
  } catch (error) {
    console.warn("Failed to fetch events from backend, using default static data", error);
  }

  return Object.keys(defaultEventsData).map((key) => ({
    id: key,
  }));
}

export default async function Page({ params }: PageProps) {
  const resolvedParams = await params;
  return <ParticipantsClient eventId={resolvedParams.id} />;
}
